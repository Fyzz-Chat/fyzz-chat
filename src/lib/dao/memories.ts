import "server-only";

import { MemoryType } from "@/lib/prisma/generated/client";
import prisma from "@/lib/prisma/prisma";

const browserMemorySelect = {
  id: true,
  type: true,
  content: true,
  confidence: true,
  category: true,
  source: true,
  createdAt: true,
} as const;

export async function getAllUserMemoriesGrouped(userId: string) {
  const rows = await prisma.memory.findMany({
    where: { userId, projectId: null },
    orderBy: { createdAt: "desc" },
    select: browserMemorySelect,
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

export async function getAllProjectMemoriesGrouped(projectId: string) {
  const rows = await prisma.memory.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: browserMemorySelect,
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

export async function getOpinionConfidence(
  id: string,
  userId: string
): Promise<number | null> {
  const memory = await prisma.memory.findUnique({
    where: { id, userId },
    select: { type: true, confidence: true },
  });
  if (memory?.type !== MemoryType.opinion) return null;
  return memory.confidence ?? 0.5;
}

export async function setOpinionConfidence(
  id: string,
  userId: string,
  confidence: number
) {
  return prisma.memory.update({
    where: { id, userId },
    data: { confidence: Math.max(0, Math.min(1, confidence)) },
  });
}
