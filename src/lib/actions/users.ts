"use server";

import "server-only";

import { randomBytes } from "node:crypto";
import type { JsonValue } from "@prisma/client/runtime/client";
import { headers } from "next/headers";
import { auth } from "@/auth";
import conf from "@/lib/config";
import { getUserFromSession, getUserIdFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma/prisma";
import publicConf from "@/lib/public-config";
import { turnstileFailedResponse, verifyTurnstile } from "@/lib/turnstile";
import type { FormState } from "@/lib/utils";
import {
  type LoginFormData,
  loginSchema,
  type RegisterFormData,
  registerSchema,
} from "@/types/auth";

export async function signInUser(
  _prevState: FormState,
  formData: LoginFormData
): Promise<FormState> {
  const parsed = loginSchema.safeParse(formData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      message: "Validation failed",
      description: firstError?.message ?? "Invalid input. Please check your data.",
      success: false,
    };
  }

  const parsedData = parsed.data;

  const turnstileResponse = parsedData["cf-turnstile-response"];
  const turnstileVerified = await verifyTurnstile(turnstileResponse);

  if (!turnstileVerified) {
    return turnstileFailedResponse;
  }

  const body = {
    email: parsedData.email,
    password: parsedData.password,
    callbackURL: publicConf.redirectPath,
  };

  try {
    await auth.api.signInEmail({ body });

    return {
      message: "Signed in successfully",
      description: "You have been successfully signed in.",
      success: true,
    };
  } catch (error) {
    logger.error(error);
    return {
      message: "Failed to sign in",
      description: "Email or password is incorrect.",
      success: false,
    };
  }
}

export async function registerUser(
  _prevState: FormState,
  formData: RegisterFormData
): Promise<FormState> {
  const parsed = registerSchema.safeParse(formData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      message: "Validation failed",
      description: firstError?.message ?? "Invalid input. Please check your data.",
      success: false,
    };
  }

  const parsedData = parsed.data;

  const turnstileResponse = parsedData["cf-turnstile-response"];
  const turnstileVerified = await verifyTurnstile(turnstileResponse);

  if (!turnstileVerified) {
    return turnstileFailedResponse;
  }

  const body = {
    name: parsedData.name,
    email: parsedData.email,
    password: parsedData.password,
    callbackURL: publicConf.redirectPath,
  };

  try {
    await auth.api.signUpEmail({ body });

    return {
      message: "Registered successfully",
      description: "You have been successfully registered.",
      success: true,
    };
  } catch (error) {
    logger.error(error);
    return {
      message: "Registration failed",
      description: "Unable to complete registration. Please try again.",
      success: false,
    };
  }
}

export async function signInAnonymously(): Promise<FormState> {
  const randomEmail = `anonymous-${randomBytes(16).toString("hex")}@fyzz.local`;
  const randomPassword = randomBytes(32).toString("hex");

  try {
    await auth.api.signUpEmail({
      body: {
        name: "Anonymous",
        email: randomEmail,
        password: randomPassword,
        callbackURL: publicConf.redirectPath,
      },
    });

    logger.info(`Anonymous user created with email: ${randomEmail}`);

    return {
      message: "Signed in anonymously",
      description: "You have been signed in as an anonymous user.",
      success: true,
    };
  } catch (error) {
    logger.error(error);
    return {
      message: "Failed to sign in",
      description: "Unable to create anonymous session. Please try again.",
      success: false,
    };
  }
}

export async function userExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return Boolean(user?.id);
}

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

export async function requestPasswordReset(email: string): Promise<FormState> {
  try {
    const response = await auth.api.requestPasswordReset({
      body: { email, redirectTo: `${conf.host}/reset-password` },
    });

    return {
      message: "Password reset email sent",
      description:
        response.message ||
        "If an account exists with this email, you will receive a password reset link.",
      success: true,
    };
  } catch (e) {
    logger.error(e);
    return {
      message: "Failed to request password reset",
      description: "Something went wrong. Please try again.",
      success: false,
    };
  }
}

export async function deleteUser(): Promise<FormState> {
  const user = await getUserFromSession();

  await prisma.user.delete({
    where: {
      id: user.id,
    },
  });

  logger.info(`User ${user.id} has been deleted`);

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
