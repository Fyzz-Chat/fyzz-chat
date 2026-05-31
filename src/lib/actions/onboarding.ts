"use server";

import "server-only";

import { createTypedMemory } from "@/lib/dao/memories";
import { getUserIdFromSession, updateUserById } from "@/lib/dao/users";
import {
  normalizeOnboardingInput,
  type OnboardingDraft,
  type OnboardingInput,
  onboardingDraftSchema,
  onboardingSchema,
} from "@/lib/onboarding";
import { buildOnboardingMemories } from "@/lib/onboarding-memories";

export type OnboardingFormState = {
  error?: string;
  success?: boolean;
};

export async function completeOnboarding(
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
      // Finishing clears the draft so a resumed-then-completed flow leaves no
      // stale partial state behind.
      onboardingDraft: undefined,
    }),
    ...memories.map((memory) => createTypedMemory(userId, memory)),
  ]);

  return { success: true };
}

// Skipping (or dismissing) records the skip timestamp so the overlay never
// auto-resurfaces, and saves the in-progress draft (raw field values + step) so
// the user can resume exactly where they left off from the profile menu. No
// memories are written here — those are append-only and would duplicate on
// repeated skips; they are committed once, on completion. The draft is the
// lossless store of what the user typed.
export async function skipOnboarding(
  draft: OnboardingDraft
): Promise<OnboardingFormState> {
  const parsed = onboardingDraftSchema.safeParse(draft);

  if (!parsed.success) {
    return { error: "Could not save your progress." };
  }

  const userId = await getUserIdFromSession();

  await updateUserById(userId, {
    onboardingSkippedAt: new Date(),
    onboardingDraft: parsed.data,
  });

  return { success: true };
}
