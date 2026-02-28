import "server-only";

import type { InputJsonValue } from "@prisma/client/runtime/client";
import { isUniqueConstraintViolation } from "@/lib/backend/utils";
import { mapMessages } from "@/lib/dao/conversations";
import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma/prisma";
import { getMessageContent } from "@/lib/utils";
import type { CustomUIMessage } from "@/types/chat";

export async function getMessages(
  conversationId: string,
  page?: number,
  limit?: number
): Promise<{ messages: CustomUIMessage[]; hasMore: boolean }> {
  const userId = await getUserIdFromSession();

  if (page === undefined || limit === undefined) {
    const messages = await prisma.message.findMany({
      where: {
        conversation: {
          id: conversationId,
          userId,
        },
      },
      select: {
        id: true,
        content: true,
        role: true,
        parts: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return {
      messages: mapMessages(userId, conversationId, messages),
      hasMore: false,
    };
  }

  const totalMessages = await prisma.message.count({
    where: {
      conversation: {
        id: conversationId,
        userId,
      },
    },
  });

  const skip = Math.max(totalMessages - page * limit, 0);
  const take = Math.min(limit, totalMessages - (page - 1) * limit);

  const messages = await prisma.message.findMany({
    where: {
      conversation: {
        id: conversationId,
        userId,
      },
    },
    select: {
      id: true,
      content: true,
      role: true,
      parts: true,
      metadata: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    skip,
    take,
  });

  const hasMore = skip > 0;

  return {
    messages: mapMessages(userId, conversationId, messages),
    hasMore,
  };
}

export async function ensureMessageSaved(
  message: CustomUIMessage,
  conversationId: string,
  promptTokens: number,
  completionTokens: number
) {
  const userId = await getUserIdFromSession();
  const { id, role, parts, metadata } = message;
  const content = getMessageContent(message);

  try {
    return await prisma.$transaction(async (tx) => {
      const newMessage = await tx.message.create({
        data: {
          id,
          role,
          content,
          parts: parts as InputJsonValue,
          conversationId,
          promptTokens,
          completionTokens,
          metadata: {
            ...metadata,
            content,
          } as InputJsonValue,
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

      return newMessage;
    });
  } catch (error) {
    if (!isUniqueConstraintViolation(error)) {
      throw error;
    }

    const existingMessage = await prisma.message.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      throw error;
    }

    if (existingMessage.conversationId !== conversationId) {
      throw new Error(`Message ${id} already exists in a different conversation.`);
    }

    return existingMessage;
  }
}

export async function saveTokenUsage(
  messageId: string,
  promptTokens: number,
  completionTokens: number
) {
  const userId = await getUserIdFromSession();

  await prisma.message.update({
    where: {
      id: messageId,
      conversation: {
        userId,
      },
    },
    data: {
      promptTokens,
      completionTokens,
    },
  });
}
