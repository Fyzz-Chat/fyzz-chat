"use server";

import "server-only";

import { deleteMemory } from "@/lib/dao/memories";
import {
  assignConversationToProject,
  createProject,
  deleteProject,
  updateProject,
} from "@/lib/dao/projects";
import { getUserIdFromSession } from "@/lib/dao/users";

export async function createProjectAction(name: string, description?: string | null) {
  const project = await createProject(name, description);
  return project;
}

export async function updateProjectAction(
  id: string,
  name: string,
  description?: string | null
) {
  const project = await updateProject(id, name, description);
  return project;
}

export async function deleteProjectAction(id: string) {
  await deleteProject(id);
}

export async function deleteMemoryAction(memoryId: string) {
  const userId = await getUserIdFromSession();
  await deleteMemory(memoryId, userId);
}

export async function assignConversationToProjectAction(
  conversationId: string,
  projectId: string | null
) {
  const conversation = await assignConversationToProject(conversationId, projectId);
  return conversation;
}
