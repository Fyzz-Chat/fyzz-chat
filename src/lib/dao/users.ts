import "server-only";

import { auth } from "@/auth";
import prisma from "@/lib/prisma/prisma";
import { redirect } from "next/navigation";
import { cache } from "react";

const unauthenticatedRedirect = "/chat?register=true";

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
}

type SessionUser = {
  id: number;
  name: string;
  email: string;
  picture: string;
  subscription: string;
  freeMessages: number;
  customerId: string | null;
  memoryEnabled: boolean;
};

export const getUserIdFromSession = cache(async (): Promise<number> => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return redirect(unauthenticatedRedirect);
  }

  return parseInt(session.user.id);
});

export const getUserFromSession = cache(async (): Promise<SessionUser> => {
  const session = await auth();

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
      picture: true,
      subscription: true,
      freeMessages: true,
      customerId: true,
      memoryEnabled: true,
    },
  });

  if (!user) {
    return redirect(unauthenticatedRedirect);
  }

  return user;
});

export const getUserFromSessionPublic = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();

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
      picture: true,
      subscription: true,
      freeMessages: true,
      customerId: true,
      memoryEnabled: true,
    },
  });

  return user;
});

export async function saveUser(profile: {
  name: string;
  email: string;
  password?: string;
  picture: string;
}) {
  const user = await prisma.user.create({
    data: {
      name: profile.name,
      email: profile.email,
      password: profile.password,
      picture: profile.picture,
    },
  });

  return user;
}

export async function getUserMemory(): Promise<string | null | undefined> {
  const userId = await getUserIdFromSession();

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user?.memory;
}

export async function appendToUserMemory(newMemory: string): Promise<void> {
  const userId = await getUserIdFromSession();

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const memory = user?.memory;
  const dateTime = new Date().toLocaleString("hu-HU", { timeZone: "UTC" });

  await prisma.user.update({
    where: { id: userId },
    data: {
      memory: {
        set: memory
          ? `${memory}\n${dateTime}: ${newMemory}`
          : `${dateTime}: ${newMemory}`,
      },
    },
  });
}
