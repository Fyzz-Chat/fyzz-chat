"use server";

import "server-only";

import type { InputJsonValue } from "@prisma/client/runtime/client";
import {
  createDeepResearch,
  DEFAULT_DEEP_RESEARCH_MODEL,
  type DeepResearchModel,
} from "@/lib/backend/openai-research";
import { getOrCreateConversation } from "@/lib/dao/conversations";
import { createPendingResearchMessage } from "@/lib/dao/research";
import { getUserIdFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma/prisma";

export async function startDeepResearch(params: {
  conversationId: string;
  query: string;
  model?: DeepResearchModel;
}): Promise<{ messageId: string; conversationId: string }> {
  const userId = await getUserIdFromSession();
  const model = params.model ?? DEFAULT_DEEP_RESEARCH_MODEL;

  const { conversation, error } = await getOrCreateConversation(
    params.conversationId,
    userId,
    model
  );
  if (error || !conversation) {
    throw new Error(`Could not access conversation: ${error ?? "unknown"}`);
  }

  await prisma.$transaction(async (tx) => {
    const seqAgg = await tx.message.aggregate({
      where: { conversationId: conversation.id },
      _max: { sequence: true },
    });
    const nextSequence = (seqAgg._max.sequence ?? 0) + 1;
    await tx.message.create({
      data: {
        role: "user",
        content: params.query,
        parts: [{ type: "text", text: params.query }] as InputJsonValue,
        conversationId: conversation.id,
        sequence: nextSequence,
        metadata: {
          createdAt: new Date().toISOString(),
          content: params.query,
        } as InputJsonValue,
      },
    });
  });

  let response: Awaited<ReturnType<typeof createDeepResearch>>;
  try {
    response = await createDeepResearch({ model, query: params.query });
  } catch (err) {
    logger.error({ message: "Failed to start deep research", error: err });
    throw new Error("Failed to start deep research");
  }

  const assistantMessage = await createPendingResearchMessage({
    conversationId: conversation.id,
    externalId: response.id,
    model,
    query: params.query,
  });

  return {
    messageId: assistantMessage.id,
    conversationId: conversation.id,
  };
}
