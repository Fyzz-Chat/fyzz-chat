"use server";

import "server-only";

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
      // TODO[SEQ_CUTOVER]: Remove createdAt fallback branch after sequence is non-null everywhere in prod.
      ...(message.sequence === null
        ? {
            createdAt: {
              gt: message.createdAt,
            },
          }
        : {
            OR: [
              {
                sequence: {
                  gt: message.sequence,
                },
              },
              {
                sequence: null,
                createdAt: {
                  gt: message.createdAt,
                },
              },
            ],
          }),
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
