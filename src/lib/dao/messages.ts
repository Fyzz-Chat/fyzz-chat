import "server-only";

import type { InputJsonValue } from "@prisma/client/runtime/client";
import { mapDbMessagesToUiMessages } from "@/lib/backend/message-mapper";
import { isUniqueConstraintViolation } from "@/lib/backend/utils";
import { MESSAGE_ORDER_ASC, whereMessagesAfterAnchor } from "@/lib/dao/message-order";
import { getUserIdFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
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
        parts: true,
        metadata: true,
        sequence: true,
        createdAt: true,
      },
      orderBy: MESSAGE_ORDER_ASC,
    });

    return {
      messages: mapDbMessagesToUiMessages(userId, conversationId, messages),
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
      parts: true,
      metadata: true,
      sequence: true,
      createdAt: true,
    },
    orderBy: MESSAGE_ORDER_ASC,
    skip,
    take,
  });

  const hasMore = skip > 0;

  return {
    messages: mapDbMessagesToUiMessages(userId, conversationId, messages),
    hasMore,
  };
}

export async function ensureMessageSaved(
  message: CustomUIMessage,
  conversationId: string,
  promptTokens: number,
  completionTokens: number
) {
  const userId = await getUserIdFromSession();
  const { id, role, parts, metadata } = message;
  const content = getMessageContent(message);
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (attempt > 1) {
      logger.warn({
        message: "Retrying sequence allocation for message save.",
        conversationId,
        messageId: id,
        attempt,
        maxAttempts,
      });
    }

    try {
      return await prisma.$transaction(async (tx) => {
        const sequenceAggregate = await tx.message.aggregate({
          where: { conversationId },
          _max: { sequence: true },
        });
        const nextSequence = (sequenceAggregate._max.sequence ?? 0) + 1;

        const newMessage = await tx.message.create({
          data: {
            id,
            role,
            content,
            parts: parts as InputJsonValue,
            conversationId,
            sequence: nextSequence,
            promptTokens,
            completionTokens,
            metadata: {
              ...metadata,
              content,
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
    } catch (error) {
      if (!isUniqueConstraintViolation(error)) {
        throw error;
      }

      const existingMessage = await prisma.message.findUnique({
        where: { id },
      });

      if (existingMessage) {
        if (existingMessage.conversationId !== conversationId) {
          throw new Error(`Message ${id} already exists in a different conversation.`);
        }
        return existingMessage;
      }

      if (maxAttempts <= attempt) {
        logger.error({
          message: "Sequence allocation retries exhausted while saving message.",
          conversationId,
          messageId: id,
          maxAttempts,
        });
        throw error;
      }
    }
  }

  throw new Error(`Could not persist message ${id} after ${maxAttempts} attempts.`);
}

export async function ensureTokenUsageSaved(
  messageId: string,
  promptTokens: number,
  completionTokens: number
) {
  const userId = await getUserIdFromSession();

  try {
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
  } catch (error) {
    logger.error(error);
  }
}

export async function deleteMessageChainAfterPersisted(
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
        "Using createdAt fallback for deleteMessageChainAfterPersisted because sequence is null.",
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
