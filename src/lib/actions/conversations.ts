"use server";

import "server-only";

import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, generateText } from "ai";
import jwt from "jsonwebtoken";
import { deleteFile } from "@/lib/aws/s3";
import { filterMessages } from "@/lib/backend/utils";
import conf from "@/lib/config";
import { mapMessages } from "@/lib/dao/conversations";
import { getUserIdFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma/prisma";
import type { CustomUIMessage, PartialConversation } from "@/types/chat";

export async function saveConversation(conversation: PartialConversation) {
  const userId = await getUserIdFromSession();

  const newConversation = await prisma.conversation.create({
    data: {
      id: conversation.id,
      title: conversation.title,
      model: conversation.model,
      user: {
        connect: {
          id: userId,
        },
      },
    },
    include: {
      messages: true,
    },
  });

  return {
    ...newConversation,
    messages: mapMessages(userId, newConversation.id, newConversation.messages),
  };
}

async function saveConversationTitle(conversationId: string, title: string) {
  const userId = await getUserIdFromSession();

  const updatedConversation = await prisma.conversation.update({
    where: { id: conversationId, userId },
    data: { title },
  });

  return updatedConversation;
}

export async function updateConversationTitle(
  conversationId: string,
  messages: CustomUIMessage[]
) {
  const modelId = "gpt-5-nano";
  const filteredMessages = filterMessages(messages, modelId);
  const { text } = await generateText({
    model: openai(modelId),
    system:
      "Your job is to generate a title for a conversation based on the messages. The title should never be longer than 3 words. Only return the title, no other text.",
    messages: await convertToModelMessages(filteredMessages),
  });

  const updatedConversation = await saveConversationTitle(conversationId, text);

  return updatedConversation;
}

export async function saveConversationModel(conversationId: string, modelId: string) {
  const userId = await getUserIdFromSession();

  try {
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId, userId },
      data: { model: modelId },
    });

    return updatedConversation;
  } catch (error) {
    logger.error(error);
    return null;
  }
}

export async function deleteConversation(conversationId: string) {
  const userId = await getUserIdFromSession();

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId, userId },
    include: {
      messages: true,
    },
  });

  const attachments =
    conversation?.messages?.flatMap((message) => {
      const parts = message.parts as Array<{ type: string; url: string }> | undefined;
      return (
        parts?.filter((part) => part.type === "file" && !part.url.startsWith("data:")) ??
        []
      );
    }) ?? [];

  if (attachments && attachments.length > 0) {
    await Promise.all(attachments.map((attachment) => deleteFile(attachment.url)));
  }

  await prisma.conversation.delete({ where: { id: conversationId, userId } });
}

export async function shareConversationUntilLatestMessage(
  conversationId: string,
  duration: string
) {
  const user = await getUserIdFromSession();

  const jwtConfigured = conf.jwtSecret !== "";

  if (!jwtConfigured) {
    throw new Error("JWT is not configured");
  }

  const message = await prisma.message.findFirst({
    where: {
      conversation: {
        id: conversationId,
        userId: user,
      },
    },
    // TODO[SEQ_CUTOVER]: Switch to sequence-first ordering once sequence is non-null everywhere in prod.
    orderBy: [{ createdAt: "desc" }, { sequence: "desc" }, { id: "desc" }],
  });

  if (!message) {
    throw new Error("No message found");
  }

  const expiresIn = addDurationToDate(new Date(), duration);

  const token = jwt.sign({ messageId: message.id, expiresIn }, conf.jwtSecret);

  return token;
}

function addDurationToDate(date: Date, duration: string): Date | null {
  if (duration === "1D") {
    date.setDate(date.getDate() + 1);
  } else if (duration === "1W") {
    date.setDate(date.getDate() + 7);
  } else if (duration === "1M") {
    date.setMonth(date.getMonth() + 1);
  } else if (duration === "INFINITY") {
    return null;
  } else {
    return null;
  }

  return date;
}
