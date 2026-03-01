import "server-only";

import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma/prisma";

export async function createShare(
  conversationId: string,
  messageId: string,
  expiresAt: Date | null
) {
  const user = await getUserIdFromSession();

  if (!user) {
    throw new Error("User not found");
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
      userId: user,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
      conversationId: conversationId,
    },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  const share = await prisma.share.create({
    data: {
      conversationId,
      messageId,
      expiresAt,
    },
  });

  return share;
}

export async function public_getShareById(shareId: string) {
  const share = await prisma.share.findUnique({
    where: {
      id: shareId,
    },
    include: {
      conversation: {
        select: {
          title: true,
        },
      },
      message: {
        select: {
          conversationId: true,
          createdAt: true,
          sequence: true,
        },
      },
    },
  });

  if (!share) {
    return null;
  }

  // Check if share has expired
  if (share.expiresAt && new Date() > share.expiresAt) {
    return null;
  }

  return share;
}
