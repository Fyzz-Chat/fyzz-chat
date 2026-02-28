import "server-only";

import type { InputJsonValue } from "@prisma/client/runtime/client";
import { getFileUrlSigned } from "@/lib/aws/s3";
import { isUniqueConstraintViolation } from "@/lib/backend/utils";
import { getUserIdFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma/prisma";
import { getMessageContent } from "@/lib/utils";
import {
  type ConversationPage,
  type CustomUIMessage,
  metadataSchema,
  type PartialMessage,
} from "@/types/chat";

export async function getConversation(id: string) {
  const userId = await getUserIdFromSession();

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: id,
      userId,
    },
    select: {
      id: true,
      title: true,
      model: true,
    },
  });

  return conversation;
}

export async function getOrCreateConversation(
  id: string,
  userId: string,
  modelId: string
): Promise<
  | { conversation: { id: string; userId: string; model: string }; error?: never }
  | { conversation: null; error: string }
> {
  const existing = await prisma.conversation.findUnique({
    where: { id },
    select: { id: true, userId: true, model: true },
  });

  if (existing) {
    if (existing.userId !== userId) {
      return { conversation: null, error: "unauthorized" };
    }
    if (existing.model !== modelId) {
      const updated = await prisma.conversation.update({
        where: { id },
        data: { model: modelId },
      });
      return { conversation: updated };
    }
    return { conversation: existing };
  }

  try {
    const newConversation = await prisma.conversation.create({
      data: { id, title: "New Chat", model: modelId, userId },
    });
    return { conversation: newConversation };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      const retry = await prisma.conversation.findUnique({ where: { id } });
      if (!retry) {
        throw error;
      }
      if (retry?.userId !== userId) {
        return { conversation: null, error: "unauthorized" };
      }
      return { conversation: retry };
    }
    throw error;
  }
}

export async function getConversationsByCursor(
  limit: number,
  cursor?: string,
  search?: string
): Promise<ConversationPage> {
  const userId = await getUserIdFromSession();

  // Parse cursor if provided (format: "timestamp_id")
  let cursorDate: Date | undefined;
  let cursorId: string | undefined;

  if (cursor) {
    const [timestamp, id] = cursor.split("_");
    cursorDate = new Date(timestamp);
    cursorId = id;
  }

  const items = await prisma.conversation.findMany({
    // +1 to check if there is a next page
    take: limit + 1,
    where: {
      userId,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              {
                messages: {
                  some: { content: { contains: search, mode: "insensitive" } },
                },
              },
            ],
          }
        : {}),
      // Cursor condition: get items older than cursor
      ...(cursorDate && cursorId
        ? {
            OR: [
              { lastMessageAt: { lt: cursorDate } },
              {
                lastMessageAt: cursorDate,
                id: { lt: cursorId },
              },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      lastMessageAt: true,
      model: true,
      messages: {
        select: {
          id: true,
          role: true,
          parts: true,
          metadata: true,
        },
        take: 1,
        // TODO[SEQ_CUTOVER]: Switch to sequence-first ordering once sequence is non-null everywhere in prod.
        orderBy: [{ createdAt: "desc" }, { sequence: "desc" }, { id: "desc" }],
      },
    },
    orderBy: [
      { lastMessageAt: "desc" },
      { id: "desc" }, // Tie-breaker for same timestamps
    ],
  });

  let nextCursor: string | undefined;
  // Check if there is a next page
  if (items.length > limit) {
    // The +1 at the top is adjusted here
    const lastItem = items.pop();
    if (lastItem) {
      // Create cursor: "timestamp_id"
      nextCursor = `${lastItem.lastMessageAt.toISOString()}_${lastItem.id}`;
    }
  }

  return {
    items: items.map((item) => ({
      ...item,
      messages: item.messages.map((message) => ({
        ...message,
        parts: safeParse(message.parts, []),
        metadata: metadataSchema.parse(message.metadata),
      })),
    })),
    nextCursor,
  };
}

export async function hasDefaultTitle(conversationId: string): Promise<boolean> {
  const userId = await getUserIdFromSession();
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
      userId,
    },
  });

  return conversation?.title === null || conversation?.title === "New Chat";
}

export async function ensureMessageAppended(
  message: CustomUIMessage,
  conversationId: string
): Promise<CustomUIMessage[]> {
  const userId = await getUserIdFromSession();
  const content = getMessageContent(message);
  const { id, role, parts, metadata } = message;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (attempt > 1) {
      logger.warn({
        message: "Retrying sequence allocation for message append.",
        conversationId,
        messageId: id,
        attempt,
        maxAttempts,
      });
    }

    try {
      const newMessage = await prisma.$transaction(async (tx) => {
        const sequenceAggregate = await tx.message.aggregate({
          where: { conversationId },
          _max: { sequence: true },
        });
        const nextSequence = (sequenceAggregate._max.sequence ?? 0) + 1;

        const createdMessage = await tx.message.create({
          data: {
            id,
            role,
            content,
            parts: parts as InputJsonValue,
            metadata: {
              ...metadata,
              content,
            } as InputJsonValue,
            conversationId,
            sequence: nextSequence,
          },
        });

        await tx.conversation.update({
          where: {
            id: conversationId,
            userId,
          },
          data: {
            lastMessageAt: new Date(),
          },
        });
        return createdMessage;
      });

      return mapMessages(userId, conversationId, [newMessage]);
    } catch (error) {
      if (!isUniqueConstraintViolation(error)) {
        throw error;
      }

      const existingMessage = await prisma.message.findUnique({
        where: { id },
      });

      if (existingMessage) {
        if (existingMessage.conversationId !== conversationId) {
          throw new Error(`Message ${id} already exists in a different conversation.`);
        }
        return mapMessages(userId, conversationId, [existingMessage]);
      }

      if (maxAttempts <= attempt) {
        logger.error({
          message: "Sequence allocation retries exhausted while appending message.",
          conversationId,
          messageId: id,
          maxAttempts,
        });
        throw error;
      }
    }
  }

  throw new Error(`Could not append message ${id} after ${maxAttempts} attempts.`);
}

export async function lockConversation(conversationId: string): Promise<boolean> {
  const userId = await getUserIdFromSession();

  try {
    await prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
          OR: [
            { locked: false },
            // Auto-release locks older than 1 minute (Vercel function timeout)
            {
              locked: true,
              updatedAt: {
                lt: new Date(Date.now() - 1 * 60 * 1000),
              },
            },
          ],
        },
      });

      if (!conversation) {
        return false;
      }

      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          locked: true,
          updatedAt: new Date(), // Update timestamp when acquiring lock
        },
      });
    });

    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

export async function unlockConversation(conversationId: string): Promise<void> {
  const userId = await getUserIdFromSession();

  await prisma.conversation.update({
    where: {
      id: conversationId,
      userId,
    },
    data: { locked: false },
  });
}

export async function isConversationLocked(conversationId: string): Promise<boolean> {
  const userId = await getUserIdFromSession();

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
      locked: true,
      // Consider lock expired if older than 1 minute (Vercel function timeout)
      updatedAt: {
        gt: new Date(Date.now() - 1 * 60 * 1000),
      },
    },
  });

  return !!conversation;
}

export function mapMessages(
  userId: string,
  conversationId: string,
  messages: PartialMessage[]
): CustomUIMessage[] {
  const mappedMessages = messages.map((message: PartialMessage) => {
    const parts = safeParse(message.parts, []);

    const metadataResult = metadataSchema.safeParse(message.metadata);
    const metadata = metadataResult.success
      ? metadataResult.data
      : {
          content: message.content ?? undefined,
          createdAt: message.createdAt ?? new Date(),
        };

    return {
      ...message,
      metadata,
      parts: mapFileParts(userId, conversationId, parts),
    };
  });

  return mappedMessages;
}

function mapFileParts(
  userId: string,
  conversationId: string,
  parts: CustomUIMessage["parts"]
) {
  return parts.map((part) => {
    if (part.type === "file" && !part.url.startsWith("data:")) {
      const key = `${userId}/${conversationId}`;

      return {
        ...part,
        url: getFileUrlSigned(key, part.url),
      };
    } else {
      return part;
    }
  });
}

export async function public_getConversationUntilMessage(messageId: string) {
  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
    },
    select: {
      conversationId: true,
      createdAt: true,
      sequence: true,
    },
  });

  if (!message) {
    return null;
  }

  if (message.sequence === null) {
    logger.warn({
      message:
        "Using createdAt fallback for public conversation slice because sequence is null.",
      messageId,
      conversationId: message.conversationId,
    });
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: message?.conversationId,
    },
    select: {
      title: true,
      messages: {
        // TODO[SEQ_CUTOVER]: Remove createdAt fallback branch after sequence is non-null everywhere in prod.
        where:
          message.sequence === null
            ? {
                createdAt: {
                  lte: message.createdAt,
                },
              }
            : {
                OR: [
                  {
                    sequence: {
                      lte: message.sequence,
                    },
                  },
                  {
                    sequence: null,
                    createdAt: {
                      lte: message.createdAt,
                    },
                  },
                ],
              },
        // TODO[SEQ_CUTOVER]: Switch to sequence-first ordering once sequence is non-null everywhere in prod.
        orderBy: [{ createdAt: "asc" }, { sequence: "asc" }, { id: "asc" }],
        select: {
          id: true,
          content: true,
          createdAt: true,
          role: true,
          parts: true,
          metadata: true,
        },
      },
    },
  });

  return {
    ...conversation,
    messages: conversation?.messages.map((message) => ({
      ...message,
    })),
  };
}

/**
 * Safely parse JSON strings that might be corrupted, null, or invalid
 * @param jsonString - The string to parse or already parsed object
 * @param fallback - The fallback value to return if parsing fails
 * @returns Parsed JSON or fallback value
 */
function safeParse<T>(jsonString: unknown, fallback: T): T {
  // Handle null or undefined
  if (jsonString == null) {
    return fallback;
  }

  // If it's already an object/array (not a string), return it as-is
  if (typeof jsonString !== "string") {
    return jsonString as T;
  }

  // Handle empty string
  if (jsonString.trim() === "") {
    return fallback;
  }

  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    logger.error(`Failed to parse JSON: ${jsonString}`, error);
    return fallback;
  }
}
