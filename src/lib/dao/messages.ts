import "server-only";

import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma/prisma";
import type { Message, UIMessage } from "ai";
import { mapMessages } from "./conversations";

export async function getMessages(
  conversationId: string,
  page?: number,
  limit?: number
): Promise<{ messages: UIMessage[]; hasMore: boolean }> {
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
        files: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return {
      messages: mapMessages(messages),
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
      files: true,
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
    messages: mapMessages(messages),
    hasMore,
  };
}

export async function saveMessage(
  message: Message,
  conversationId: string,
  model: string,
  promptTokens: number,
  completionTokens: number
) {
  const userId = await getUserIdFromSession();

  const { experimental_attachments, ...messageWithoutAttachments } = message;

  return prisma.$transaction(async (tx) => {
    const newMessage = await tx.message.create({
      data: {
        ...messageWithoutAttachments,
        files: JSON.stringify(experimental_attachments),
        parts: JSON.stringify(message.parts),
        toolInvocations: JSON.stringify(message.toolInvocations),
        conversationId,
        model,
        promptTokens,
        completionTokens,
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
