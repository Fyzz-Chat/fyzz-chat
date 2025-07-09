"use server";

import "server-only";

import { InvalidLoginError, hashPassword, signIn, verifyPassword } from "@/auth";
import { getTranslations } from "@/lib/backend/locale/dictionaries";
import type { FormState } from "@/lib/utils";
import type { JsonValue } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { getUserIdFromSession } from "../dao/users";
import prisma from "../prisma/prisma";

export async function signInUser(
  _prevState: any,
  formData: FormData
): Promise<FormState> {
  const translations = await getTranslations();

  const options = {
    email: formData.get("email"),
    password: formData.get("password"),
    callbackUrl: "/",
    redirect: false,
  };

  try {
    await signIn("credentials", options);

    return {
      message: translations.login.success.title,
      description: translations.login.success.description,
      success: true,
    };
  } catch (error: any) {
    if (error?.cause?.err instanceof InvalidLoginError) {
      return {
        message: translations.login.errors.generic.title,
        description: translations.login.errors.generic.description,
        success: false,
      };
    } else {
      return {
        message: translations.login.errors.invalidCredentials.title,
        description: translations.login.errors.invalidCredentials.description,
        success: false,
      };
    }
  }
}

export async function registerUser(
  _prevState: any,
  formData: FormData
): Promise<FormState> {
  const options = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    callbackUrl: "/",
    redirect: false,
    register: true,
  };

  try {
    await signIn("credentials", options);

    return {
      message: "Registered successfully",
      description: "You have been successfully registered.",
      success: true,
    };
  } catch (error: any) {
    if (error.cause.err instanceof InvalidLoginError) {
      return {
        message: "Something went wrong",
        description: "It's on us. Please try again.",
        success: false,
      };
    } else {
      return {
        message: "Registration failed",
        description: "User already exists.",
        success: false,
      };
    }
  }
}

export async function updateUserPassword(
  _prevState: any,
  formData: FormData
): Promise<FormState> {
  const userId = await getUserIdFromSession();
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      password: true,
    },
  });

  if (!user) {
    return {
      message: "User not found",
      description: "Please try again.",
      success: false,
    };
  }

  const currentPassword = formData.get("current-password") as string;
  const newPassword = formData.get("new-password") as string;
  const confirmPassword = formData.get("confirm-password") as string;

  if (user.password) {
    const passwordConfirmed = await verifyPassword(currentPassword, user.password);

    if (!passwordConfirmed) {
      return {
        message: "Invalid password",
        description: "Please try again.",
      };
    }
  }

  if (newPassword.length < 1 || confirmPassword.length < 1) {
    return {
      message: "Password too short",
      description: "Please try again.",
      success: false,
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      message: "Password mismatch",
      description: "Please try again.",
      success: false,
    };
  }

  const hashedPassword = hashPassword(newPassword);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  revalidatePath("/settings");

  return {
    message: "Password updated",
    description: "Your password has been updated.",
    success: true,
  };
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

export async function updateUserMemory(
  _prevState: any,
  formData: FormData
): Promise<FormState> {
  const userId = await getUserIdFromSession();

  const memory = formData.get("memory") as string;

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
