import "server-only";

import { MemoryType } from "@/lib/prisma/generated/client";
import prisma from "@/lib/prisma/prisma";

export async function getUserMemories(userId: string) {
  return prisma.memory.findMany({
    where: { userId, projectId: null },
    orderBy: { createdAt: "asc" },
  });
}

export async function getAllUserMemoriesGrouped(userId: string) {
  const rows = await prisma.memory.findMany({
    where: { userId, projectId: null },
    orderBy: { createdAt: "desc" },
  });
  const grouped: Record<MemoryType, typeof rows> = {
    [MemoryType.fact]: [],
    [MemoryType.opinion]: [],
    [MemoryType.learning]: [],
    [MemoryType.context]: [],
    [MemoryType.feedback]: [],
  };
  for (const row of rows) grouped[row.type].push(row);
  return grouped;
}

const memorySelect = {
  id: true,
  content: true,
  createdAt: true,
} as const;

export async function getProjectMemories(projectId: string) {
  return prisma.memory.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: memorySelect,
  });
}

export async function appendMemory(userId: string, content: string, projectId?: string) {
  return prisma.memory.create({
    data: {
      content,
      userId,
      projectId: projectId ?? null,
    },
  });
}

export async function replaceUserMemories(userId: string, entries: string[]) {
  await prisma.$transaction([
    prisma.memory.deleteMany({
      where: { userId, projectId: null, type: MemoryType.fact },
    }),
    ...entries.map((content) =>
      prisma.memory.create({
        data: { content, userId, projectId: null, type: MemoryType.fact },
      })
    ),
  ]);
}

export async function deleteMemory(id: string, userId: string) {
  return prisma.memory.delete({
    where: { id, userId },
  });
}

type MemoryQueryOptions = {
  minConfidence?: number;
  limit?: number;
  recent?: boolean;
};

export async function getMemoriesByType(
  userId: string,
  type: MemoryType,
  opts: MemoryQueryOptions = {}
) {
  return prisma.memory.findMany({
    where: {
      userId,
      projectId: null,
      type,
      ...(opts.minConfidence !== undefined
        ? { confidence: { gte: opts.minConfidence } }
        : {}),
    },
    orderBy: { createdAt: opts.recent ? "desc" : "asc" },
    take: opts.limit,
  });
}

export async function getProjectMemoriesByType(
  projectId: string,
  type: MemoryType,
  opts: MemoryQueryOptions = {}
) {
  return prisma.memory.findMany({
    where: {
      projectId,
      type,
      ...(opts.minConfidence !== undefined
        ? { confidence: { gte: opts.minConfidence } }
        : {}),
    },
    orderBy: { createdAt: opts.recent ? "desc" : "asc" },
    take: opts.limit,
  });
}

type CreateTypedMemoryInput = {
  type: MemoryType;
  content: string;
  confidence?: number;
  category?: string;
  source?: string;
  projectId?: string | null;
  conversationId?: string | null;
};

export async function createTypedMemory(userId: string, data: CreateTypedMemoryInput) {
  return prisma.memory.create({
    data: {
      userId,
      type: data.type,
      content: data.content,
      confidence: data.confidence,
      category: data.category,
      source: data.source,
      projectId: data.projectId ?? null,
      conversationId: data.conversationId ?? null,
    },
  });
}

export async function updateOpinionConfidence(id: string, userId: string, delta: number) {
  const memory = await prisma.memory.findUnique({ where: { id, userId } });
  if (!memory || memory.type !== MemoryType.opinion) return null;
  const current = memory.confidence ?? 0.5;
  const next = Math.max(0, Math.min(1, current + delta));
  return prisma.memory.update({
    where: { id, userId },
    data: { confidence: next },
  });
}
