import "server-only";

import { awsConfigured, uploadFile } from "@/lib/aws/s3";
import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma/prisma";
import type { Attachment, Message, UIMessage } from "ai";
import { v4 as uuidv4 } from "uuid";
import { mapMessages } from "./conversations";

export async function getMessages(conversationId: string, page?: number, limit?: number) {
  const userId = await getUserIdFromSession();

  if (page === undefined || limit === undefined) {
    const messages = await prisma.message.findMany({
      where: {
        conversation: {
          id: conversationId,
          userId,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return {
      messages: await mapMessages(messages),
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
    orderBy: {
      createdAt: "asc",
    },
    skip,
    take,
  });

  const hasMore = skip > 0;

  return {
    messages: await mapMessages(messages),
    hasMore,
  };
}

export async function saveMessage(message: Message | UIMessage, conversationId: string) {
  const userId = await getUserIdFromSession();

  const newMessage = await prisma.message.create({
    data: {
      ...message,
      parts: JSON.stringify(message.parts),
      toolInvocations: JSON.stringify(message.toolInvocations),
      conversationId,
    },
  });

  await prisma.conversation.update({
    where: {
      id: conversationId,
      userId,
    },
    data: {
      lastMessageAt: new Date(),
    },
  });

  return newMessage;
}

export async function uploadAttachments(
  messageAttachments: Attachment[],
  userId: number,
  conversationId: string
) {
  // Validate file sizes upfront before starting any uploads
  for (const attachment of messageAttachments) {
    const base64Data = attachment.url.split(",")[1];
    const decodedData = Buffer.from(base64Data, "base64");
    if (decodedData.length > 25 * 1024 * 1024) {
      throw new Error(`File "${attachment.name}" exceeds the maximum size limit of 25MB`);
    }
  }

  const attachments = await Promise.all(
    messageAttachments.map(async (attachment: Attachment) => {
      const base64Data = attachment.url.split(",")[1];
      const decodedData = Buffer.from(base64Data, "base64");

      const blob = new Blob([decodedData], { type: attachment.contentType });

      const fileId = uuidv4();
      const filePath = `${userId}/${conversationId}/${fileId}`;

      const file = new File([blob], attachment.name || fileId, {
        type: attachment.contentType,
      });

      if (awsConfigured) {
        await uploadFile(file, filePath);
      }

      return {
        name: attachment.name || fileId,
        contentType: attachment.contentType,
        url: filePath,
      };
    })
  );

  return attachments;
}
