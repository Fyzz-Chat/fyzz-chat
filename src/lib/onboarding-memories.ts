import { normalizeOnboardingInput, type OnboardingInput } from "@/lib/onboarding";
import { MemoryType } from "@/lib/prisma/generated/client";

// Kept separate from `onboarding.ts` because it imports the generated Prisma
// client (MemoryType). `onboarding.ts` stays client-safe so the onboarding
// overlay (a client component) can import its schemas/types without pulling
// Prisma into the browser bundle.

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
