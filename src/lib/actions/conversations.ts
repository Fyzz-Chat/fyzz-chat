"use server";

import "server-only";

import { awsConfigured, deleteFile } from "@/lib/aws/s3";
import { getUserIdFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma/prisma";
import type { PartialConversation } from "@/types/chat";
import { openai } from "@ai-sdk/openai";
import type { JsonValue } from "@prisma/client/runtime/library";
import { type Message, generateText } from "ai";

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

  return newConversation;
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
  messages: Message[]
) {
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system:
      "Your job is to generate a title for a conversation based on the messages. The title should never be longer than 3 words. Only return the title, no other text.",
    messages,
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
  } catch (error: any) {
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

  if (awsConfigured) {
    const attachments =
      conversation?.messages
        .flatMap((message) =>
          (message.files as JsonValue[])?.map((file: any) => file?.url)
        )
        .filter((url) => !!url) || [];

    await Promise.all(
      attachments.map(async (attachment) => {
        await deleteFile(attachment);
      })
    );
  }

  await prisma.conversation.delete({ where: { id: conversationId, userId } });
}
