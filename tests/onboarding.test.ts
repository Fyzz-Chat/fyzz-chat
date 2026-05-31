import { describe, expect, it } from "bun:test";
import {
  normalizeOnboardingInput,
  onboardingSchema,
  parseOnboardingDraft,
} from "../src/lib/onboarding";
import { buildOnboardingMemories } from "../src/lib/onboarding-memories";

describe("onboarding memory seeds", () => {
  it("normalizes blank fields without losing meaningful values", () => {
    expect(
      normalizeOnboardingInput({
        displayName: " Rico ",
        agentName: " ",
        role: "\nBuilder\n",
        preferences: "",
        context: "  OSS upstream only  ",
      })
    ).toEqual({
      displayName: "Rico",
      agentName: undefined,
      role: "Builder",
      preferences: undefined,
      context: "OSS upstream only",
    });
  });

  it("builds typed memories with no conversation linkage", () => {
    const memories = buildOnboardingMemories({
      role: "Founder building an OSS chat app.",
      preferences: "Be direct and concise.",
      context: "Public repo must not include billing.",
    });

    expect(memories).toHaveLength(3);
    expect(memories.map((memory) => memory.type)).toEqual(["fact", "opinion", "context"]);
    expect(memories.every((memory) => memory.source === "onboarding")).toBe(true);
    expect(memories.every((memory) => memory.projectId === null)).toBe(true);
    expect(memories.every((memory) => memory.conversationId === null)).toBe(true);
    expect(memories[1]).toMatchObject({ confidence: 0.8, category: "preferences" });
  });

  it("does not seed empty memories", () => {
    expect(
      buildOnboardingMemories({
        role: " ",
        preferences: "",
        context: "\n",
      })
    ).toEqual([]);
  });
});

describe("onboarding schema validation", () => {
  it("accepts input within the field length limits", () => {
    const result = onboardingSchema.safeParse({
      displayName: "Rico",
      agentName: "Jarvis",
      role: "a".repeat(240),
      preferences: "b".repeat(600),
      context: "c".repeat(600),
    });

    expect(result.success).toBe(true);
  });

  it("rejects input that exceeds a field length limit", () => {
    const result = onboardingSchema.safeParse({
      displayName: "a".repeat(61),
    });

    expect(result.success).toBe(false);
  });
});

describe("onboarding draft", () => {
  it("parses a valid draft so resume restores values and step", () => {
    const draft = parseOnboardingDraft({
      values: { displayName: "Rico", agentName: "Jarvis" },
      step: 2,
    });

    expect(draft).not.toBeNull();
    expect(draft?.step).toBe(2);
    expect(draft?.values.displayName).toBe("Rico");
  });

  it("returns null for malformed draft instead of throwing", () => {
    expect(parseOnboardingDraft(null)).toBeNull();
    expect(parseOnboardingDraft({ values: {}, step: -1 })).toBeNull();
    expect(parseOnboardingDraft({ step: 1 })).toBeNull();
    expect(parseOnboardingDraft("garbage")).toBeNull();
  });
});
