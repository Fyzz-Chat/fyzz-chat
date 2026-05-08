"use server";

import "server-only";

import type { InputJsonValue } from "@prisma/client/runtime/client";
import { updateConversationTitle } from "@/lib/actions/conversations";
import {
  cancelDeepResearch as cancelOpenAIResearch,
  createDeepResearch,
  DEFAULT_DEEP_RESEARCH_MODEL,
  type DeepResearchModel,
} from "@/lib/backend/openai-research";
import { getOrCreateConversation, hasDefaultTitle } from "@/lib/dao/conversations";
import { markResearchFailed } from "@/lib/dao/research";
import { getUserIdFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma/prisma";
import type { CustomUIMessage } from "@/types/chat";

export async function startDeepResearch(params: {
  conversationId: string;
  query: string;
  model?: DeepResearchModel;
  userMessageId?: string;
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

  let response: Awaited<ReturnType<typeof createDeepResearch>>;
  try {
    response = await createDeepResearch({ model, query: params.query });
  } catch (err) {
    logger.error({ message: "Failed to start deep research", error: err });
    throw new Error("Failed to start deep research");
  }

  const assistantMessage = await prisma.$transaction(async (tx) => {
    const userSeqAgg = await tx.message.aggregate({
      where: { conversationId: conversation.id },
      _max: { sequence: true },
    });
    const userSequence = (userSeqAgg._max.sequence ?? 0) + 1;
    await tx.message.create({
      data: {
        ...(params.userMessageId && { id: params.userMessageId }),
        role: "user",
        content: params.query,
        parts: [{ type: "text", text: params.query }] as InputJsonValue,
        conversationId: conversation.id,
        sequence: userSequence,
        metadata: {
          createdAt: new Date(),
          content: params.query,
        } as InputJsonValue,
      },
    });

    const assistant = await tx.message.create({
      data: {
        role: "assistant",
        status: "pending",
        externalId: response.id,
        parts: [] as InputJsonValue,
        content: null,
        conversationId: conversation.id,
        sequence: userSequence + 1,
        metadata: {
          model,
          createdAt: new Date(),
          deepResearch: { query: params.query },
        } as InputJsonValue,
      },
    });

    await tx.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    return assistant;
  });

  try {
    if (await hasDefaultTitle(conversation.id)) {
      const titlerMessage: CustomUIMessage = {
        id: params.userMessageId ?? "research-titler",
        role: "user",
        parts: [{ type: "text", text: params.query }],
        metadata: { content: params.query, createdAt: new Date() },
      };
      await updateConversationTitle(conversation.id, [titlerMessage], userId);
    }
  } catch (err) {
    logger.warn({
      message: "Failed to update conversation title for deep research",
      conversationId: conversation.id,
      error: err,
    });
  }

  return {
    messageId: assistantMessage.id,
    conversationId: conversation.id,
  };
}

export async function cancelDeepResearch(messageId: string): Promise<void> {
  const userId = await getUserIdFromSession();
  const message = await prisma.message.findFirst({
    where: { id: messageId, conversation: { userId } },
    select: { id: true, status: true, externalId: true },
  });
  if (!message) {
    throw new Error("Research message not found");
  }
  if (message.status !== "pending") {
    return;
  }

  if (message.externalId) {
    try {
      await cancelOpenAIResearch(message.externalId);
    } catch (err) {
      logger.warn({
        message: "OpenAI cancel failed; marking message failed anyway",
        error: err,
      });
    }
  }

  await markResearchFailed(message.id, "Cancelled by user");
}
