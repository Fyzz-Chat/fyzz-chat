import "server-only";

import type { InputJsonValue } from "@prisma/client/runtime/client";
import prisma from "@/lib/prisma/prisma";

export async function markResearchComplete(
  messageId: string,
  params: {
    parts: InputJsonValue;
    content: string;
    promptTokens: number;
    completionTokens: number;
  }
) {
  return prisma.message.update({
    where: { id: messageId },
    data: {
      status: "complete",
      parts: params.parts,
      content: params.content,
      promptTokens: params.promptTokens,
      completionTokens: params.completionTokens,
    },
  });
}

export async function markResearchFailed(messageId: string, reason: string) {
  return prisma.message.update({
    where: { id: messageId },
    data: {
      status: "failed",
      failedReason: reason,
    },
  });
}

export async function getResearchMessage(messageId: string, userId: string) {
  return prisma.message.findFirst({
    where: {
      id: messageId,
      conversation: { userId },
    },
    select: {
      id: true,
      role: true,
      status: true,
      externalId: true,
      conversationId: true,
      parts: true,
      content: true,
      metadata: true,
      failedReason: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
