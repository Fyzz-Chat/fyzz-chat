import "server-only";

import type { InputJsonValue } from "@prisma/client/runtime/client";
import { MESSAGE_ORDER_ASC, whereMessagesUpToAnchor } from "@/lib/dao/message-order";
import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma/prisma";

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
    // Create the new conversation
    const newConversation = await tx.conversation.create({
      data: {
        title: `${originalConversation.title} (branched)`,
        model: originalConversation.model,
        userId,
      },
    });

    // Copy messages with new IDs and recalculated sequences
    for (let i = 0; i < messagesToCopy.length; i++) {
      const msg = messagesToCopy[i];
      await tx.message.create({
        data: {
          role: msg.role,
          parts: msg.parts as InputJsonValue,
          metadata: msg.metadata as InputJsonValue,
          content: msg.content,
          promptTokens: msg.promptTokens,
          completionTokens: msg.completionTokens,
          sequence: i + 1, // Recalculate sequence starting from 1
          conversationId: newConversation.id,
        },
      });
    }

    // Update lastMessageAt to the last copied message's time
    await tx.conversation.update({
      where: { id: newConversation.id },
      data: {
        lastMessageAt: new Date(),
      },
    });

    return { newConversationId: newConversation.id };
  });

  return result;
}
