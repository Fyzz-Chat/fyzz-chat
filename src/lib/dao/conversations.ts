import "server-only";

import { awsConfigured, getFileUrlSigned } from "@/lib/aws/s3";
import { getUserIdFromSession } from "@/lib/dao/users";
import type { Message } from "@/lib/prisma/client";
import prisma from "@/lib/prisma/prisma";
import type { JsonArray } from "@prisma/client/runtime/library";
import type { UIMessage } from "ai";
import { logger } from "../logger";

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

export async function getConversations(
  page: number,
  limit: number,
  search?: string
): Promise<{ conversations: any[]; hasMore: boolean }> {
  const userId = await getUserIdFromSession();
  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
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
      },
      select: {
        id: true,
        title: true,
        lastMessageAt: true,
        model: true,
        messages: {
          select: {
            id: true,
            content: true,
          },
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.conversation.count({
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
      },
    }),
  ]);

  const hasMore = skip + conversations.length < total;

  return {
    conversations,
    hasMore,
  };
}

export async function appendMessageToConversation(
  message: UIMessage,
  conversationId: string
) {
  const userId = await getUserIdFromSession();

  const newMessage = await prisma.message.create({
    data: {
      ...message,
      parts: JSON.stringify(message.parts),
      toolInvocations: JSON.stringify(message.toolInvocations),
      conversationId,
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

  return mapMessages([newMessage]);
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
        throw new Error("Could not acquire lock");
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
  } catch (error: any) {
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

export async function mapMessages(messages: Message[]) {
  const mappedMessages = await Promise.all(
    messages.map(async (message) => ({
      ...message,
      role: message.role as "system" | "user" | "assistant" | "data",
      reasoning: message.reasoning ?? undefined,
      parts: JSON.parse(message.parts as string),
      toolInvocations: JSON.parse(message.toolInvocations as string),
      experimental_attachments:
        (message.files as JsonArray[])?.map((file: any) => ({
          name: file.name,
          contentType: file.contentType,
          url: awsConfigured ? getFileUrlSigned(file.url) : file.url,
        })) ?? [],
    }))
  );

  return mappedMessages;
}
