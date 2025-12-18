import "server-only";

import type { InputJsonValue } from "@prisma/client/runtime/client";
import { getFileUrlSigned } from "@/lib/aws/s3";
import { getUserIdFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma/prisma";
import { getMessageContent } from "@/lib/utils";
import type { CustomUIMessage, PartialMessage } from "@/types/chat";

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

export async function getConversationsByCursor(
  limit: number,
  cursor?: string,
  search?: string
) {
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
          content: true,
        },
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
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
        metadata: {
          content: message.content,
        },
      })),
    })),
    nextCursor,
  };
}

export async function appendMessageToConversation(
  message: CustomUIMessage,
  conversationId: string
): Promise<CustomUIMessage[]> {
  const userId = await getUserIdFromSession();

  const newMessage = await prisma.$transaction(async (tx) => {
    const createdMessage = await tx.message.create({
      data: {
        ...message,
        content: getMessageContent(message),
        parts: message.parts as InputJsonValue,
        toolInvocations: undefined,
        conversationId,
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
    const { files: _, ...messageWithoutFiles } = message;
    const parts = safeParse(messageWithoutFiles.parts, []);

    return {
      ...messageWithoutFiles,
      role: messageWithoutFiles.role as "system" | "user" | "assistant",
      parts: filterParts(userId, conversationId, parts),
      metadata: {
        model: message.model,
        content: message.content,
        createdAt: message.createdAt,
        reasoningDurations: message.reasoningDurations as { id: string; ms: number }[],
      },
    };
  });

  return mappedMessages;
}

function filterParts(
  userId: string,
  conversationId: string,
  parts: CustomUIMessage["parts"]
) {
  return parts
    .filter((part) => {
      if (part.type.startsWith("tool-")) {
        return (
          part.type === "tool-memory" ||
          part.type === "tool-generateImage" ||
          part.type === "tool-readUrl" ||
          part.type === "tool-readYoutube" ||
          part.type === "tool-code_interpreter"
        );
      } else {
        return true;
      }
    })
    .map((part) => {
      if (part.type === "tool-generateImage" && part.state === "output-available") {
        const output = part.output as { url?: string };

        return {
          ...part,
          output: {
            ...output,
            image: getFileUrlSigned(`${userId}/${conversationId}`, output.url ?? ""),
          },
        };
      } else if (part.type === "file" && !part.url.startsWith("data:")) {
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
    },
  });

  if (!message) {
    return null;
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: message?.conversationId,
    },
    select: {
      title: true,
      messages: {
        where: {
          createdAt: {
            lte: message.createdAt,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          role: true,
          parts: true,
        },
      },
    },
  });

  return conversation;
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
