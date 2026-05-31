import "server-only";

import type { InputJsonValue } from "@prisma/client/runtime/client";
import { mapDbMessagesToUiMessages } from "@/lib/backend/message-mapper";
import { isUniqueConstraintViolation } from "@/lib/backend/utils";
import { MESSAGE_ORDER_ASC, whereMessagesUpToAnchor } from "@/lib/dao/message-order";
import { getUserIdFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma/prisma";
import { getMessageContent } from "@/lib/utils";
import type { ConversationPage, CustomUIMessage } from "@/types/chat";

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
      projectId: true,
    },
  });

  return conversation;
}

export async function getConversationProjectId(id: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id, userId },
    select: { projectId: true },
  });
  return conversation?.projectId ?? null;
}

const conversationSelect = {
  id: true,
  userId: true,
  model: true,
  project: { select: { id: true, name: true, description: true } },
} as const;

type ConversationResult = {
  id: string;
  userId: string;
  model: string;
  project: { id: string; name: string; description: string | null } | null;
};

export async function getOrCreateConversation(
  id: string,
  userId: string,
  modelId: string,
  projectId?: string
): Promise<
  | { conversation: ConversationResult; error?: never }
  | { conversation: null; error: string }
> {
  const existing = await prisma.conversation.findUnique({
    where: { id },
    select: conversationSelect,
  });

  if (existing) {
    if (existing.userId !== userId) {
      return { conversation: null, error: "unauthorized" };
    }
    if (existing.model !== modelId) {
      const updated = await prisma.conversation.update({
        where: { id },
        data: { model: modelId },
        select: conversationSelect,
      });
      return { conversation: updated };
    }
    return { conversation: existing };
  }

  try {
    const newConversation = await prisma.conversation.create({
      data: {
        id,
        title: "New Chat",
        model: modelId,
        userId,
        projectId: projectId ?? null,
      },
      select: conversationSelect,
    });
    return { conversation: newConversation };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      const retry = await prisma.conversation.findUnique({
        where: { id },
        select: conversationSelect,
      });
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
  search?: string,
  projectId?: string | null
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
      // Filter by project if specified
      ...(projectId === null
        ? { projectId: null }
        : projectId !== undefined
          ? { projectId }
          : {}),
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
      branchedFrom: true,
      projectId: true,
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
    items,
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

      return mapDbMessagesToUiMessages([newMessage]);
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
        return mapDbMessagesToUiMessages([existingMessage]);
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
        where: whereMessagesUpToAnchor(message),
        orderBy: MESSAGE_ORDER_ASC,
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
