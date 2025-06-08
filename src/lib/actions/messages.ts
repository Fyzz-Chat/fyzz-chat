"use server";

import "server-only";

import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma/prisma";

export async function deleteMessageChainAfter(messageId: string, conversationId: string) {
  const userId = await getUserIdFromSession();

  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
      conversationId,
      conversation: {
        userId,
      },
    },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  await prisma.message.deleteMany({
    where: {
      conversation: {
        id: conversationId,
        userId,
      },
      createdAt: {
        gt: message.createdAt,
      },
    },
  });
}
