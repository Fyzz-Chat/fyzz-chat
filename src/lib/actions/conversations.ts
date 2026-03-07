"use server";

import "server-only";

import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, generateText } from "ai";
import { deleteFile } from "@/lib/aws/s3";
import { mapDbMessagesToUiMessages } from "@/lib/backend/message-mapper";
import { filterMessages } from "@/lib/backend/utils";
import { branchConversation } from "@/lib/dao/branching";
import { createShare } from "@/lib/dao/shares";
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
      ...(conversation.projectId && {
        project: {
          connect: {
            id: conversation.projectId,
          },
        },
      }),
    },
    include: {
      messages: true,
    },
  });

  return {
    ...newConversation,
    messages: mapDbMessagesToUiMessages(
      userId,
      newConversation.id,
      newConversation.messages
    ),
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

export async function shareConversationUntilMessage(
  conversationId: string,
  messageId: string,
  duration: string
) {
  const user = await getUserIdFromSession();

  // Verify the message exists and belongs to the user's conversation
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      conversation: {
        id: conversationId,
        userId: user,
      },
    },
  });

  if (!message) {
    throw new Error("Message not found or access denied");
  }

  const expiresAt = addDurationToDate(new Date(), duration);

  const share = await createShare(conversationId, messageId, expiresAt);

  return share.id;
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

export async function branchConversationAction(
  conversationId: string,
  messageId: string
): Promise<{ newConversationId: string }> {
  const result = await branchConversation(conversationId, messageId);
  return result;
}
