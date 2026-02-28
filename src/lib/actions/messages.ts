"use server";

import "server-only";

import { whereMessagesAfterAnchor } from "@/lib/dao/message-order";
import { getUserIdFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma/prisma";

export async function deleteMessageChainAfter(
  messageId: string,
  conversationId: string,
  newContent?: string
) {
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

  if (message.sequence === null) {
    logger.warn({
      message:
        "Using createdAt fallback for deleteMessageChainAfter because sequence is null.",
      conversationId,
      messageId,
    });
  }

  await prisma.message.deleteMany({
    where: {
      conversation: {
        id: conversationId,
        userId,
      },
      ...whereMessagesAfterAnchor(message),
    },
  });

  if (message.role === "assistant") {
    await prisma.message.delete({
      where: {
        id: messageId,
        conversationId,
        conversation: {
          userId,
        },
      },
    });
  } else if (newContent) {
    await prisma.message.update({
      where: {
        id: messageId,
        conversationId,
        conversation: {
          userId,
        },
      },
      data: {
        content: newContent,
        parts: [
          {
            type: "text",
            text: newContent,
          },
        ],
      },
    });
  }
}
