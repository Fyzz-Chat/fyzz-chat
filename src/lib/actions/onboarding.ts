"use server";

import "server-only";

import { redirect } from "next/navigation";
import { createTypedMemory } from "@/lib/dao/memories";
import { getUserIdFromSession, updateUserById } from "@/lib/dao/users";
import {
  buildOnboardingMemories,
  normalizeOnboardingInput,
  type OnboardingInput,
  onboardingSchema,
} from "@/lib/onboarding";

export type OnboardingFormState = {
  error?: string;
};

export async function completeOnboarding(
  _prevState: OnboardingFormState,
  input: OnboardingInput
): Promise<OnboardingFormState> {
  const parsed = onboardingSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Please shorten the onboarding fields and try again." };
  }

  const userId = await getUserIdFromSession();
  const normalized = normalizeOnboardingInput(parsed.data);
  const memories = buildOnboardingMemories(normalized);

  await Promise.all([
    updateUserById(userId, {
      displayName: normalized.displayName ?? null,
      agentName: normalized.agentName ?? null,
      onboardingCompletedAt: new Date(),
    }),
    ...memories.map((memory) => createTypedMemory(userId, memory)),
  ]);

  redirect("/chat");
}
