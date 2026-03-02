import "server-only";

import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma/prisma";
import type { ProjectWithCount } from "@/types/chat";

export async function getProjects(): Promise<ProjectWithCount[]> {
  const userId = await getUserIdFromSession();

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { conversations: true },
      },
    },
  });

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    userId: project.userId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    conversationCount: project._count.conversations,
  }));
}

export async function createProject(name: string) {
  const userId = await getUserIdFromSession();

  const project = await prisma.project.create({
    data: {
      name,
      userId,
    },
  });

  return project;
}

export async function updateProject(id: string, name: string) {
  const userId = await getUserIdFromSession();

  const project = await prisma.project.update({
    where: { id, userId },
    data: { name },
  });

  return project;
}

export async function deleteProject(id: string) {
  const userId = await getUserIdFromSession();

  // Delete project - conversations will become unassigned due to onDelete: SetNull
  await prisma.project.delete({
    where: { id, userId },
  });
}

export async function assignConversationToProject(
  conversationId: string,
  projectId: string | null
) {
  const userId = await getUserIdFromSession();

  // Verify conversation belongs to user
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  });

  if (!conversation) {
    throw new Error("Conversation not found or access denied");
  }

  // If assigning to a project, verify project belongs to user
  if (projectId) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error("Project not found or access denied");
    }
  }

  const updatedConversation = await prisma.conversation.update({
    where: { id: conversationId, userId },
    data: { projectId },
  });

  return updatedConversation;
}

export async function getConversationsByProject(projectId: string | null) {
  const userId = await getUserIdFromSession();

  const conversations = await prisma.conversation.findMany({
    where: {
      userId,
      projectId,
    },
    orderBy: [{ lastMessageAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      title: true,
      model: true,
      lastMessageAt: true,
      branchedFrom: true,
      projectId: true,
      messages: {
        select: {
          id: true,
          role: true,
          parts: true,
          metadata: true,
        },
        take: 1,
        orderBy: { sequence: "desc" },
      },
    },
  });

  return conversations;
}

export async function getUnassignedConversationsCount(): Promise<number> {
  const userId = await getUserIdFromSession();

  const count = await prisma.conversation.count({
    where: {
      userId,
      projectId: null,
    },
  });

  return count;
}
