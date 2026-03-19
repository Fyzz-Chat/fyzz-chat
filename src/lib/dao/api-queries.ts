import "server-only";

import { safeParseJson } from "@/lib/backend/message-mapper";
import { MESSAGE_ORDER_ASC } from "@/lib/dao/message-order";
import prisma from "@/lib/prisma/prisma";
import { metadataSchema } from "@/types/chat";

export async function apiListConversations(
  userId: string,
  limit: number,
  cursor?: string,
  search?: string,
  projectId?: string | null
) {
  let cursorDate: Date | undefined;
  let cursorId: string | undefined;

  if (cursor) {
    const [timestamp, id] = cursor.split("_");
    cursorDate = new Date(timestamp);
    cursorId = id;
  }

  const items = await prisma.conversation.findMany({
    take: limit + 1,
    where: {
      userId,
      ...(projectId === null
        ? { projectId: null }
        : projectId !== undefined
          ? { projectId }
          : {}),
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
      ...(cursorDate && cursorId
        ? {
            OR: [
              { lastMessageAt: { lt: cursorDate } },
              { lastMessageAt: cursorDate, id: { lt: cursorId } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      model: true,
      lastMessageAt: true,
      projectId: true,
      branchedFrom: true,
    },
    orderBy: [{ lastMessageAt: "desc" }, { id: "desc" }],
  });

  let nextCursor: string | undefined;
  if (items.length > limit) {
    const lastItem = items.pop();
    if (lastItem) {
      nextCursor = `${lastItem.lastMessageAt.toISOString()}_${lastItem.id}`;
    }
  }

  return { items, nextCursor };
}

export async function apiGetConversation(userId: string, conversationId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId, userId },
    select: {
      id: true,
      title: true,
      model: true,
      projectId: true,
      lastMessageAt: true,
      createdAt: true,
      messages: {
        select: {
          id: true,
          role: true,
          content: true,
          parts: true,
          metadata: true,
          sequence: true,
          createdAt: true,
        },
        orderBy: MESSAGE_ORDER_ASC,
      },
    },
  });

  if (!conversation) return null;

  return {
    ...conversation,
    messages: conversation.messages.map((m) => ({
      ...m,
      parts: safeParseJson(m.parts, []),
      metadata: metadataSchema.parse(m.metadata),
    })),
  };
}

export async function apiListProjects(userId: string) {
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { conversations: true } },
      conversations: {
        select: { lastMessageAt: true },
        orderBy: { lastMessageAt: "desc" },
        take: 1,
      },
    },
  });

  return projects.map((project) => {
    const latestConversationAt = project.conversations[0]?.lastMessageAt;
    const lastActivityAt =
      latestConversationAt && latestConversationAt > project.updatedAt
        ? latestConversationAt
        : project.updatedAt;

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      conversationCount: project._count.conversations,
      lastActivityAt,
      createdAt: project.createdAt,
    };
  });
}
