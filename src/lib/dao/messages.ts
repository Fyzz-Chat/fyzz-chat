import "server-only";

import { awsConfigured, uploadFile } from "@/lib/aws/s3";
import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma/prisma";
import type { Attachment, Message, UIMessage } from "ai";
import { v4 as uuidv4 } from "uuid";
import { mapMessages } from "./conversations";

export async function getMessages(conversationId: string, page?: number, limit?: number) {
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
        updatedAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return {
      messages: await mapMessages(messages),
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
      updatedAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    skip,
    take,
  });

  const hasMore = skip > 0;

  return {
    messages: await mapMessages(messages),
    hasMore,
  };
}

export async function saveMessage(
  message: Message | UIMessage,
  conversationId: string,
  model: string,
  promptTokens: number,
  completionTokens: number
) {
  const userId = await getUserIdFromSession();

  const newMessage = await prisma.message.create({
    data: {
      ...message,
      parts: JSON.stringify(message.parts),
      toolInvocations: JSON.stringify(message.toolInvocations),
      conversationId,
      model,
      promptTokens,
      completionTokens,
    },
  });

  await prisma.conversation.update({
    where: {
      id: conversationId,
      userId,
    },
    data: {
      lastMessageAt: new Date(),
    },
  });

  return newMessage;
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
