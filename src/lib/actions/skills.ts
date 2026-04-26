"use server";

import "server-only";

import {
  createSkill as createSkillDao,
  DuplicateSkillNameError,
  deleteSkill as deleteSkillDao,
  InvalidSkillNameError,
  updateSkill as updateSkillDao,
} from "@/lib/dao/skills";
import { getUserIdFromSession, updateUserById } from "@/lib/dao/users";
import { logger } from "@/lib/logger";

type SkillActionError = "duplicate_name" | "invalid_name" | "server";

export type SkillActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: SkillActionError; message: string };

function mapError(error: unknown): SkillActionResult<never> {
  if (error instanceof DuplicateSkillNameError) {
    return { ok: false, error: "duplicate_name", message: error.message };
  }
  if (error instanceof InvalidSkillNameError) {
    return { ok: false, error: "invalid_name", message: error.message };
  }
  logger.error(error);
  return { ok: false, error: "server", message: "Failed to save skill." };
}

export async function createSkill(data: {
  name: string;
  description: string;
  content: string;
  projectId?: string | null;
}): Promise<SkillActionResult<{ id: string }>> {
  const userId = await getUserIdFromSession();
  try {
    const skill = await createSkillDao(userId, data);
    return { ok: true, data: { id: skill.id } };
  } catch (error) {
    return mapError(error);
  }
}

export async function updateSkill(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    content: string;
    enabled: boolean;
  }>
): Promise<SkillActionResult<{ id: string }>> {
  const userId = await getUserIdFromSession();
  try {
    const skill = await updateSkillDao(id, userId, data);
    return { ok: true, data: { id: skill.id } };
  } catch (error) {
    return mapError(error);
  }
}

export async function deleteSkill(id: string): Promise<SkillActionResult<null>> {
  const userId = await getUserIdFromSession();
  try {
    await deleteSkillDao(id, userId);
    return { ok: true, data: null };
  } catch (error) {
    logger.error(error);
    return { ok: false, error: "server", message: "Failed to delete skill." };
  }
}

export async function updateUserSkillsEnabled(skillsEnabled: boolean): Promise<boolean> {
  const userId = await getUserIdFromSession();
  await updateUserById(userId, { skillsEnabled });
  return skillsEnabled;
}
