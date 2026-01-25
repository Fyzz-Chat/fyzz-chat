import "server-only";

import type { InputJsonValue } from "@prisma/client/runtime/client";
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
        model: true,
        parts: true,
        metadata: true,
        reasoningDurations: true,
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
      model: true,
      parts: true,
      metadata: true,
      reasoningDurations: true,
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

export async function saveMessage(
  message: CustomUIMessage,
  reasoningDurations: { id: string; ms: number }[],
  conversationId: string,
  model: string,
  promptTokens: number,
  completionTokens: number
) {
  const userId = await getUserIdFromSession();

  return prisma.$transaction(async (tx) => {
    const newMessage = await tx.message.create({
      data: {
        ...message,
        content: getMessageContent(message),
        parts: message.parts as InputJsonValue,
        conversationId,
        model,
        promptTokens,
        completionTokens,
        reasoningDurations,
        metadata: {
          ...message.metadata,
          content: getMessageContent(message),
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
