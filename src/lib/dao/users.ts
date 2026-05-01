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

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
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
      memoryEnabled: true,
      skillsEnabled: true,
      mcpServers: true,
      defaultModel: true,
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
};

export const getUserIdFromSession = cache(async (): Promise<string> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return redirect(unauthenticatedRedirect);
  }

  return session.user.id;
});

export const getUserFromSession = cache(async (): Promise<SessionUser> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect(unauthenticatedRedirect);
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user?.email || "",
    },
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
    },
  });

  if (!user) {
    return redirect(unauthenticatedRedirect);
  }

  return user;
});

export const getUserFromSessionPublic = cache(async (): Promise<SessionUser | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user?.email || "",
    },
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
    },
  });

  return user;
});
