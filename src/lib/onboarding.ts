import { z } from "zod";

export const AGENT_NAME_STORAGE_KEY = "fyzz:agent-name";

export const onboardingSchema = z.object({
  displayName: z.string().trim().max(60).optional(),
  agentName: z.string().trim().max(60).optional(),
  role: z.string().trim().max(240).optional(),
  preferences: z.string().trim().max(600).optional(),
  context: z.string().trim().max(600).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const onboardingDraftSchema = z.object({
  values: onboardingSchema,
  step: z.number().int().min(0).max(10),
});

export type OnboardingDraft = z.infer<typeof onboardingDraftSchema>;

export function parseOnboardingDraft(value: unknown): OnboardingDraft | null {
  const result = onboardingDraftSchema.safeParse(value);
  return result.success ? result.data : null;
}

function optional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function normalizeOnboardingInput(input: OnboardingInput): OnboardingInput {
  return {
    displayName: optional(input.displayName),
    agentName: optional(input.agentName),
    role: optional(input.role),
    preferences: optional(input.preferences),
    context: optional(input.context),
  };
}
