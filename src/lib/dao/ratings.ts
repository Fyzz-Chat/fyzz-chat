import "server-only";

import prisma from "@/lib/prisma/prisma";

export class MessageNotFoundError extends Error {
  constructor() {
    super("Message not found or access denied.");
    this.name = "MessageNotFoundError";
  }
}

export async function upsertRating(userId: string, messageId: string, value: number) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: {
      conversationId: true,
      conversation: { select: { userId: true } },
    },
  });

  if (message?.conversation.userId !== userId) {
    throw new MessageNotFoundError();
  }

  return prisma.rating.upsert({
    where: { messageId },
    update: { value },
    create: {
      messageId,
      value,
      userId,
      conversationId: message.conversationId,
    },
  });
}

export async function getRatingForMessage(messageId: string, userId: string) {
  return prisma.rating.findUnique({
    where: { messageId, userId },
  });
}

export async function getRatingsForUser(userId: string) {
  return prisma.rating.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRatingsForConversation(conversationId: string, userId: string) {
  return prisma.rating.findMany({
    where: { conversationId, userId },
  });
}

export async function getRecentLowRatedMessages(userId: string, limit = 5) {
  return prisma.rating.findMany({
    where: { userId, value: { lt: 0 } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      createdAt: true,
      message: { select: { content: true } },
    },
  });
}

export async function deleteRating(messageId: string, userId: string) {
  const existing = await prisma.rating.findUnique({
    where: { messageId, userId },
  });
  if (!existing) return null;
  return prisma.rating.delete({ where: { id: existing.id } });
}
