"use server";

import "server-only";

import { randomBytes } from "node:crypto";
import type { JsonValue } from "@prisma/client/runtime/client";
import { headers } from "next/headers";
import { auth } from "@/auth";
import conf from "@/lib/config";
import {
  getUserFromSession,
  getUserIdFromSession,
  updateUserById,
} from "@/lib/dao/users";
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

function isEmailDomainAllowed(email: string): boolean {
  const domains = conf.authorizedEmailDomains;
  if (domains.length === 0) return true;
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && domains.includes(domain);
}

const domainRestrictedResponse: FormState = {
  message: "Authentication restricted",
  description: "Unauthorized email domain.",
  success: false,
};

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

  if (!isEmailDomainAllowed(parsedData.email)) {
    return domainRestrictedResponse;
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

  if (!isEmailDomainAllowed(parsedData.email)) {
    return domainRestrictedResponse;
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
  if (!conf.anonymousLogin) {
    return {
      message: "Anonymous login disabled",
      description: "This feature is not enabled.",
      success: false,
    };
  }

  if (conf.authorizedEmailDomains.length > 0) {
    return domainRestrictedResponse;
  }

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

    logger.info("Anonymous user created successfully");

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

export async function userExists(email: string): Promise<boolean | "domain_restricted"> {
  if (!isEmailDomainAllowed(email)) {
    return "domain_restricted";
  }

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
  await updateUserById(userId, { memoryEnabled });
  return memoryEnabled;
}

export async function updateDefaultModel(defaultModel: string): Promise<string> {
  const userId = await getUserIdFromSession();
  await updateUserById(userId, { defaultModel });
  return defaultModel;
}

const PERSONA_MAX_CHARS = 60;

function normalizePersonaField(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, PERSONA_MAX_CHARS);
}

export async function updateUserPersona(input: {
  displayName?: string;
  agentName?: string;
}): Promise<void> {
  const userId = await getUserIdFromSession();

  const data: { displayName?: string | null; agentName?: string | null } = {};
  if (input.displayName !== undefined) {
    data.displayName = normalizePersonaField(input.displayName);
  }
  if (input.agentName !== undefined) {
    data.agentName = normalizePersonaField(input.agentName);
  }

  if (Object.keys(data).length === 0) return;

  await updateUserById(userId, data);
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

  await updateUserById(userId, { mcpServers });

  return "success";
}
