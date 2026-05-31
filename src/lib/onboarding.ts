import { z } from "zod";
import { MemoryType } from "@/lib/prisma/generated/client";

export const onboardingSchema = z.object({
  displayName: z.string().trim().max(60).optional(),
  agentName: z.string().trim().max(60).optional(),
  role: z.string().trim().max(240).optional(),
  preferences: z.string().trim().max(600).optional(),
  context: z.string().trim().max(600).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export type OnboardingMemorySeed = {
  type: MemoryType;
  content: string;
  confidence?: number;
  category: string;
  source: string;
  projectId: null;
  conversationId: null;
};

const source = "onboarding";

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

export function buildOnboardingMemories(input: OnboardingInput): OnboardingMemorySeed[] {
  const normalized = normalizeOnboardingInput(input);
  const memories: OnboardingMemorySeed[] = [];

  if (normalized.role) {
    memories.push({
      type: MemoryType.fact,
      content: normalized.role,
      category: "identity",
      source,
      projectId: null,
      conversationId: null,
    });
  }

  if (normalized.preferences) {
    memories.push({
      type: MemoryType.opinion,
      content: normalized.preferences,
      confidence: 0.8,
      category: "preferences",
      source,
      projectId: null,
      conversationId: null,
    });
  }

  if (normalized.context) {
    memories.push({
      type: MemoryType.context,
      content: normalized.context,
      category: "background",
      source,
      projectId: null,
      conversationId: null,
    });
  }

  return memories;
}
