import "server-only";

import prisma from "@/lib/prisma/prisma";

export async function getUserMemories(userId: string) {
  return prisma.memory.findMany({
    where: { userId, projectId: null },
    orderBy: { createdAt: "asc" },
  });
}

export async function getProjectMemories(projectId: string) {
  return prisma.memory.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
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
    prisma.memory.deleteMany({ where: { userId, projectId: null } }),
    ...entries.map((content) =>
      prisma.memory.create({
        data: { content, userId, projectId: null },
      })
    ),
  ]);
}
