import "server-only";

import type { InputJsonValue } from "@prisma/client/runtime/client";
import { copyFile } from "@/lib/aws/s3";
import { MESSAGE_ORDER_ASC, whereMessagesUpToAnchor } from "@/lib/dao/message-order";
import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma/prisma";

interface FileMapping {
  sourceKey: string;
  destinationKey: string;
  partUrlStored: string;
  newPartUrl: string;
}

interface MessageWithFiles {
  messageId: string;
  parts: Array<{ type: string; url?: string }>;
  fileMappings: FileMapping[];
}

export async function branchConversation(
  conversationId: string,
  messageId: string
): Promise<{ newConversationId: string }> {
  const userId = await getUserIdFromSession();

  // Get the anchor message to verify ownership and get sequence/createdAt
  const anchorMessage = await prisma.message.findFirst({
    where: {
      id: messageId,
      conversation: {
        id: conversationId,
        userId,
      },
    },
    select: {
      id: true,
      sequence: true,
      createdAt: true,
    },
  });

  if (!anchorMessage) {
    throw new Error("Message not found or access denied");
  }

  // Get the original conversation
  const originalConversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
      userId,
    },
    select: {
      title: true,
      model: true,
    },
  });

  if (!originalConversation) {
    throw new Error("Conversation not found");
  }

  // Get all messages up to and including the anchor message
  const messagesToCopy = await prisma.message.findMany({
    where: {
      conversationId,
      ...whereMessagesUpToAnchor(anchorMessage),
    },
    orderBy: MESSAGE_ORDER_ASC,
    select: {
      role: true,
      parts: true,
      metadata: true,
      content: true,
      promptTokens: true,
      completionTokens: true,
    },
  });

  // Create new conversation and copy messages in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const newConversation = await tx.conversation.create({
      data: {
        title: `${originalConversation.title} (branched)`,
        model: originalConversation.model,
        userId,
      },
    });

    const messagesWithFiles: MessageWithFiles[] = [];

    for (let i = 0; i < messagesToCopy.length; i++) {
      const msg = messagesToCopy[i];
      const parts = (msg.parts || []) as Array<{ type: string; url?: string }>;

      const fileMappings: FileMapping[] = [];
      for (const part of parts) {
        if (part.type !== "file" || !part.url || part.url.startsWith("data:")) {
          continue;
        }
        const partUrlStored = part.url;
        const fileId = partUrlStored.includes("/")
          ? (partUrlStored.split("/").at(-1) ?? "")
          : partUrlStored;
        const sourceKey = `${userId}/${conversationId}/${fileId}`;
        const destinationKey = `${userId}/${newConversation.id}/${fileId}`;
        fileMappings.push({
          sourceKey,
          destinationKey,
          partUrlStored,
          newPartUrl: fileId,
        });
      }

      const createdMessage = await tx.message.create({
        data: {
          role: msg.role,
          parts: msg.parts as InputJsonValue,
          metadata: msg.metadata as InputJsonValue,
          content: msg.content,
          promptTokens: msg.promptTokens,
          completionTokens: msg.completionTokens,
          sequence: i + 1,
          conversationId: newConversation.id,
        },
      });

      if (fileMappings.length > 0) {
        messagesWithFiles.push({
          messageId: createdMessage.id,
          parts,
          fileMappings,
        });
      }
    }

    await tx.conversation.update({
      where: { id: newConversation.id },
      data: { lastMessageAt: new Date() },
    });

    return { newConversationId: newConversation.id, messagesWithFiles };
  });

  for (const msgWithFiles of result.messagesWithFiles) {
    for (const mapping of msgWithFiles.fileMappings) {
      await copyFile(mapping.sourceKey, mapping.destinationKey);
    }

    const updatedParts = msgWithFiles.parts.map((part) => {
      if (part.type === "file" && part.url) {
        const mapping = msgWithFiles.fileMappings.find(
          (m) => m.partUrlStored === part.url
        );
        if (mapping) {
          return { ...part, url: mapping.newPartUrl };
        }
      }
      return part;
    });

    await prisma.message.update({
      where: { id: msgWithFiles.messageId },
      data: { parts: updatedParts as InputJsonValue },
    });
  }

  return { newConversationId: result.newConversationId };
}
