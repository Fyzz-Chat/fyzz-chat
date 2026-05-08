import "server-only";

import { isUniqueConstraintViolation } from "@/lib/backend/utils";
import prisma from "@/lib/prisma/prisma";

export class DuplicateSkillNameError extends Error {
  constructor(name: string) {
    super(`A skill named "${name}" already exists.`);
    this.name = "DuplicateSkillNameError";
  }
}

export class InvalidSkillNameError extends Error {
  constructor(name: string) {
    super(
      `Invalid skill name "${name}". Skill names must be kebab-case: lowercase letters and digits separated by single hyphens (e.g. "code-reviewer").`
    );
    this.name = "InvalidSkillNameError";
  }
}

const KEBAB_CASE_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function isValidSkillName(name: string): boolean {
  return KEBAB_CASE_RE.test(name);
}

function assertValidSkillName(name: string) {
  if (!isValidSkillName(name)) {
    throw new InvalidSkillNameError(name);
  }
}

const FRONTMATTER_SOFT_CAP = 30;

const skillPromptSelect = {
  id: true,
  name: true,
  description: true,
} as const;

export async function getUserSkills(userId: string) {
  return prisma.skill.findMany({
    where: { userId, projectId: null, enabled: true },
    orderBy: [{ lastActivatedAt: { sort: "desc", nulls: "last" } }, { name: "asc" }],
    take: FRONTMATTER_SOFT_CAP,
    select: skillPromptSelect,
  });
}

export async function getProjectSkills(projectId: string) {
  return prisma.skill.findMany({
    where: { projectId, enabled: true },
    orderBy: [{ lastActivatedAt: { sort: "desc", nulls: "last" } }, { name: "asc" }],
    take: FRONTMATTER_SOFT_CAP,
    select: skillPromptSelect,
  });
}

export async function getAllUserSkillsForSettings(userId: string) {
  return prisma.skill.findMany({
    where: { userId, projectId: null },
    orderBy: { name: "asc" },
  });
}

export async function getAllProjectSkillsForSettings(projectId: string) {
  return prisma.skill.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
  });
}

export async function getSkillById(id: string, userId: string) {
  return prisma.skill.findUnique({
    where: { id, userId },
  });
}

export async function countEnabledSkillsInScope(userId: string, projectId?: string) {
  return prisma.skill.count({
    where: {
      enabled: true,
      OR: [{ userId, projectId: null }, ...(projectId ? [{ projectId }] : [])],
    },
  });
}

export async function touchSkillActivation(id: string, userId: string) {
  await prisma.skill.updateMany({
    where: { id, userId },
    data: { lastActivatedAt: new Date() },
  });
}

type CreateSkillInput = {
  name: string;
  description: string;
  content: string;
  projectId?: string | null;
};

export async function createSkill(userId: string, data: CreateSkillInput) {
  assertValidSkillName(data.name);
  const { projectId, ...rest } = data;
  try {
    return await prisma.skill.create({
      data: { ...rest, userId, projectId: projectId ?? null },
    });
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      throw new DuplicateSkillNameError(data.name);
    }
    throw error;
  }
}

type UpdateSkillInput = Partial<{
  name: string;
  description: string;
  content: string;
  enabled: boolean;
}>;

export async function updateSkill(id: string, userId: string, data: UpdateSkillInput) {
  if (data.name !== undefined) {
    assertValidSkillName(data.name);
  }
  try {
    return await prisma.skill.update({
      where: { id, userId },
      data,
    });
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      throw new DuplicateSkillNameError(data.name ?? "");
    }
    throw error;
  }
}

export async function deleteSkill(id: string, userId: string) {
  return prisma.skill.delete({
    where: { id, userId },
  });
}
