"use server";

import "server-only";

import { auth } from "@/auth";
import { getUserIdFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma/prisma";
import type { FormState } from "@/lib/utils";
import type { JsonValue } from "@prisma/client/runtime/client";
import { headers } from "next/headers";

export async function setUserPassword(password: string): Promise<FormState> {
  const sessionHeaders = await headers();
  try {
    await auth.api.setPassword({
      body: {
        newPassword: password,
      },
      headers: sessionHeaders,
    });
    return {
      message: "Password set successfully",
      description: "You can now sign in with your email and password.",
      success: true,
    };
  } catch (e) {
    logger.error(e);

    return {
      message: "Failed to set password",
      description: "Something went wrong. Please try again.",
      success: false,
    };
  }
}

export async function deleteUser(): Promise<FormState> {
  const userId = await getUserIdFromSession();

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  return {
    message: "User deleted",
    description: "Your account has been deleted.",
    success: true,
  };
}

export async function updateUserMemoryEnabled(memoryEnabled: boolean): Promise<boolean> {
  const userId = await getUserIdFromSession();

  await prisma.user.update({
    where: { id: userId },
    data: {
      memoryEnabled,
    },
  });

  return memoryEnabled;
}

export async function updateDefaultModel(defaultModel: string): Promise<string> {
  const userId = await getUserIdFromSession();

  await prisma.user.update({
    where: { id: userId },
    data: { defaultModel },
  });

  return defaultModel;
}

export async function updateUserMemory(memory: string): Promise<FormState> {
  const userId = await getUserIdFromSession();

  await prisma.user.update({
    where: { id: userId },
    data: {
      memory,
    },
  });

  return {
    message: "Memory updated",
    description: "Your memory has been updated.",
    success: true,
  };
}

export async function getMcpServers(): Promise<JsonValue | undefined> {
  const userId = await getUserIdFromSession();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      mcpServers: true,
    },
  });

  return user?.mcpServers;
}

export async function saveMcpServers(mcpServers: string): Promise<string> {
  const userId = await getUserIdFromSession();

  try {
    if (mcpServers !== "") {
      const parsed = JSON.parse(mcpServers);
      if (!parsed.mcpServers) {
        return "missing_key";
      }

      // Prettify the JSON before saving
      mcpServers = JSON.stringify(parsed, null, 4);
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return "invalid_json";
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      mcpServers,
    },
  });

  return "success";
}
