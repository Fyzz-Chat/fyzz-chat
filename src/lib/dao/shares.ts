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

export async function deleteShare(shareId: string) {
  const user = await getUserIdFromSession();

  if (!user) {
    throw new Error("User not found");
  }

  // Verify the share exists and belongs to the user's conversation
  const share = await prisma.share.findFirst({
    where: {
      id: shareId,
      conversation: {
        userId: user,
      },
    },
  });

  if (!share) {
    throw new Error("Share not found or access denied");
  }

  await prisma.share.delete({
    where: {
      id: shareId,
    },
  });
}

export async function getSharesByConversationId(conversationId: string) {
  const user = await getUserIdFromSession();

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();
  const shares = await prisma.share.findMany({
    where: {
      conversationId,
      conversation: {
        userId: user,
      },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: {
      id: true,
      messageId: true,
      expiresAt: true,
    },
  });

  return shares;
}
