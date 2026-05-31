import { describe, expect, it } from "bun:test";
import { buildOnboardingMemories, normalizeOnboardingInput } from "../src/lib/onboarding";

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
