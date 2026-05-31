import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import { Prisma } from "@/lib/prisma/generated/client";
import prisma from "@/lib/prisma/prisma";

const unauthenticatedRedirect = "/login";

export async function updateUserById(
  userId: string,
  data: Prisma.UserUpdateInput
): Promise<void> {
  try {
    await prisma.user.update({ where: { id: userId }, data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      logger.warn(`Stale session: user ${userId} no longer exists; redirecting to login`);
      redirect(unauthenticatedRedirect);
    }
    throw error;
  }
}

export async function getUserPersona(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { displayName: true, agentName: true },
  });
}

export const getUserSettingsProfile = cache(async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscription: true,
      memoryEnabled: true,
      skillsEnabled: true,
      mcpServers: true,
      defaultModel: true,
      onboardingCompletedAt: true,
      displayName: true,
      agentName: true,
      accounts: { select: { password: true } },
    },
  });
  if (!user) return null;
  const { accounts, ...rest } = user;
  return {
    ...rest,
    hasPassword: accounts.some((a) => Boolean(a.password)),
  };
});

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  subscription: string;
  freeMessages: number;
  customerId: string | null;
  memoryEnabled: boolean;
  skillsEnabled: boolean;
  defaultModel: string | null;
  mcpServers: Prisma.JsonValue | null;
  onboardingCompletedAt: Date | null;
  onboardingSkippedAt: Date | null;
  onboardingDraft: Prisma.JsonValue | null;
};

export const getUserFromSessionPublic = cache(async (): Promise<SessionUser | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      subscription: true,
      freeMessages: true,
      customerId: true,
      memoryEnabled: true,
      skillsEnabled: true,
      defaultModel: true,
      mcpServers: true,
      onboardingCompletedAt: true,
      onboardingSkippedAt: true,
      onboardingDraft: true,
    },
  });
});

export const getUserFromSession = cache(async (): Promise<SessionUser> => {
  const user = await getUserFromSessionPublic();
  if (!user) return redirect(unauthenticatedRedirect);
  return user;
});

export const getUserIdFromSession = cache(async (): Promise<string> => {
  const user = await getUserFromSessionPublic();
  if (!user?.id) return redirect(unauthenticatedRedirect);
  return user.id;
});
