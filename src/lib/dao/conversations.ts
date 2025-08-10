import "server-only";

import { awsConfigured, getFileUrlSigned } from "@/lib/aws/s3";
import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma/prisma";
import type { PartialMessage } from "@/types/chat";
import type { JsonArray } from "@prisma/client/runtime/library";
import type { UIMessage } from "ai";
import { logger } from "../logger";

export async function getConversation(id: string) {
  const userId = await getUserIdFromSession();

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: id,
      userId,
    },
    select: {
      id: true,
      title: true,
      model: true,
    },
  });

  return conversation;
}

export async function getConversationsByCursor(
  limit: number,
  cursor?: string,
  search?: string
) {
  const userId = await getUserIdFromSession();

  // Parse cursor if provided (format: "timestamp_id")
  let cursorDate: Date | undefined;
  let cursorId: string | undefined;

  if (cursor) {
    const [timestamp, id] = cursor.split("_");
    cursorDate = new Date(timestamp);
    cursorId = id;
  }

  const items = await prisma.conversation.findMany({
    // +1 to check if there is a next page
    take: limit + 1,
    where: {
      userId,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              {
                messages: {
                  some: { content: { contains: search, mode: "insensitive" } },
                },
              },
            ],
          }
        : {}),
      // Cursor condition: get items older than cursor
      ...(cursorDate && cursorId
        ? {
            OR: [
              { lastMessageAt: { lt: cursorDate } },
              {
                lastMessageAt: cursorDate,
                id: { lt: cursorId },
              },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      lastMessageAt: true,
      model: true,
      messages: {
        select: {
          content: true,
        },
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: [
      { lastMessageAt: "desc" },
      { id: "desc" }, // Tie-breaker for same timestamps
    ],
  });

  let nextCursor: string | undefined = undefined;
  // Check if there is a next page
  if (items.length > limit) {
    // The +1 at the top is adjusted here
    const lastItem = items.pop();
    if (lastItem) {
      // Create cursor: "timestamp_id"
      nextCursor = `${lastItem.lastMessageAt.toISOString()}_${lastItem.id}`;
    }
  }

  return {
    items,
    nextCursor,
  };
}

export async function appendMessageToConversation(
  message: UIMessage,
  conversationId: string
) {
  const userId = await getUserIdFromSession();

  const newMessage = await prisma.$transaction(async (tx) => {
    const createdMessage = await tx.message.create({
      data: {
        ...message,
        parts: JSON.stringify(message.parts),
        toolInvocations: undefined,
        conversationId,
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
    return createdMessage;
  });

  return mapMessages([newMessage]);
}

export async function lockConversation(conversationId: string): Promise<boolean> {
  const userId = await getUserIdFromSession();

  try {
    await prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
          OR: [
            { locked: false },
            // Auto-release locks older than 1 minute (Vercel function timeout)
            {
              locked: true,
              updatedAt: {
                lt: new Date(Date.now() - 1 * 60 * 1000),
              },
            },
          ],
        },
      });

      if (!conversation) {
        throw new Error("Could not acquire lock");
      }

      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          locked: true,
          updatedAt: new Date(), // Update timestamp when acquiring lock
        },
      });
    });

    return true;
  } catch (error: any) {
    logger.error(error);
    return false;
  }
}

export async function unlockConversation(conversationId: string): Promise<void> {
  const userId = await getUserIdFromSession();

  await prisma.conversation.update({
    where: {
      id: conversationId,
      userId,
    },
    data: { locked: false },
  });
}

export async function isConversationLocked(conversationId: string): Promise<boolean> {
  const userId = await getUserIdFromSession();

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
      locked: true,
      // Consider lock expired if older than 1 minute (Vercel function timeout)
      updatedAt: {
        gt: new Date(Date.now() - 1 * 60 * 1000),
      },
    },
  });

  return !!conversation;
}

export function mapMessages(messages: PartialMessage[]): UIMessage[] {
  const mappedMessages = messages.map((message) => {
    const { files, ...messageWithoutFiles } = message;
    const parts = safeParse(messageWithoutFiles.parts, []);
    const parsedFiles = safeParse(files, []);

    return {
      ...messageWithoutFiles,
      content: messageWithoutFiles.content || "",
      role: messageWithoutFiles.role as "system" | "user" | "assistant" | "data",
      parts: filterParts(parts),
      experimental_attachments: parsedFiles.map((file: any) => ({
        name: file.name,
        contentType: file.contentType,
        url: awsConfigured ? getFileUrlSigned(file.url) : file.url,
      })),
    };
  });

  return mappedMessages;
}

function filterParts(parts: UIMessage["parts"]) {
  return parts
    .filter((part) => {
      if (part.type === "step-start") {
        return false;
      }
      if (part.type === "tool-invocation") {
        return (
          part.toolInvocation.toolName === "memory" ||
          part.toolInvocation.toolName === "generateImage"
        );
      }
      return true;
    })
    .map((part) => {
      if (
        part.type === "tool-invocation" &&
        part.toolInvocation.toolName === "generateImage" &&
        part.toolInvocation.state === "result"
      ) {
        return {
          ...part,
          toolInvocation: {
            ...part.toolInvocation,
            result: {
              ...part.toolInvocation.result,
              image: getFileUrlSigned(part.toolInvocation.result.url),
            },
          },
        };
      }
      return part;
    });
}

export async function public_getConversationUntilMessage(messageId: string) {
  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
    },
    select: {
      conversationId: true,
      createdAt: true,
    },
  });

  if (!message) {
    return null;
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: message?.conversationId,
    },
    select: {
      title: true,
      messages: {
        where: {
          createdAt: {
            lte: message.createdAt,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          role: true,
          parts: true,
        },
      },
    },
  });

  return {
    ...conversation,
    messages: conversation?.messages.map((message: any) => ({
      ...message,
      parts: JSON.parse(message.parts as string),
    })),
  };
}

/**
 * Safely parse JSON strings that might be corrupted, null, or invalid
 * @param jsonString - The string to parse or already parsed object
 * @param fallback - The fallback value to return if parsing fails
 * @returns Parsed JSON or fallback value
 */
function safeParse<T>(jsonString: any, fallback: T): T {
  // Handle null or undefined
  if (jsonString == null) {
    return fallback;
  }

  // If it's already an object/array (not a string), return it as-is
  if (typeof jsonString !== "string") {
    return jsonString as T;
  }

  // Handle empty string
  if (jsonString.trim() === "") {
    return fallback;
  }

  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    logger.error(`Failed to parse JSON: ${jsonString}`, error);
    return fallback;
  }
}
