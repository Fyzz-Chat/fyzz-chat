"use server";

import "server-only";

import {
  assignConversationToProject,
  createProject,
  deleteProject,
  updateProject,
} from "@/lib/dao/projects";

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

export async function assignConversationToProjectAction(
  conversationId: string,
  projectId: string | null
) {
  const conversation = await assignConversationToProject(conversationId, projectId);
  return conversation;
}
