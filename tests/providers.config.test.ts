import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { restoreProviderTestEnv, setupProviderTestEnv } from "./providers.test-utils";
import type { ProviderId, RuntimePreset } from "../src/types/provider";

let getProvidersPublic: typeof import("../src/lib/backend/providers").getProvidersPublic;
let countModels: typeof import("../src/lib/backend/providers").countModels;

const expectedCatalogShape: {
  id: ProviderId;
  models: { id: string; runtimePreset: RuntimePreset }[];
}[] = [
  {
    id: "openai",
    models: [
      { id: "gpt-4.1-mini", runtimePreset: "chat" },
      { id: "gpt-4.1", runtimePreset: "chat" },
      { id: "gpt-5-nano", runtimePreset: "chat" },
      { id: "gpt-5-mini", runtimePreset: "chat" },
      { id: "gpt-5", runtimePreset: "chat" },
      { id: "gpt-5-codex", runtimePreset: "chat" },
      { id: "gpt-5.1", runtimePreset: "chat" },
      { id: "gpt-5.1-codex", runtimePreset: "chat" },
      { id: "gpt-5.2", runtimePreset: "chat" },
      { id: "gpt-5.2-codex", runtimePreset: "chat" },
      { id: "gpt-5.3-codex", runtimePreset: "chat" },
      { id: "o3-mini", runtimePreset: "chat" },
      { id: "o4-mini", runtimePreset: "chat" },
      { id: "o3", runtimePreset: "chat" },
    ],
  },
  {
    id: "anthropic",
    models: [
      { id: "claude-3-haiku-20240307", runtimePreset: "chat" },
      { id: "claude-3-5-haiku-20241022", runtimePreset: "chat" },
      { id: "claude-haiku-4-5-20251001", runtimePreset: "chat" },
      { id: "claude-sonnet-4-20250514", runtimePreset: "chat" },
      { id: "claude-sonnet-4-5", runtimePreset: "chat" },
      { id: "claude-sonnet-4-6", runtimePreset: "chat" },
      { id: "claude-opus-4-5", runtimePreset: "chat" },
      { id: "claude-opus-4-6", runtimePreset: "chat" },
    ],
  },
  {
    id: "google",
    models: [
      { id: "gemini-2.5-flash", runtimePreset: "chat" },
      { id: "gemini-2.5-flash-lite", runtimePreset: "chat" },
      { id: "gemini-2.5-pro", runtimePreset: "chat" },
      { id: "gemini-3-flash-preview", runtimePreset: "chat" },
      { id: "gemini-3-pro-preview", runtimePreset: "chat" },
      { id: "gemini-3.1-pro-preview", runtimePreset: "chat" },
      { id: "gemini-2.5-flash-image", runtimePreset: "chat" },
      { id: "gemma-3-27b-it", runtimePreset: "chat" },
    ],
  },
  {
    id: "xai",
    models: [
      { id: "grok-3-mini", runtimePreset: "chat" },
      { id: "grok-3", runtimePreset: "chat" },
      { id: "grok-4-0709", runtimePreset: "responses" },
      { id: "grok-4-fast-non-reasoning", runtimePreset: "responses" },
      { id: "grok-code-fast-1", runtimePreset: "chat" },
      { id: "grok-4-1-fast-non-reasoning", runtimePreset: "responses" },
    ],
  },
  {
    id: "llama",
    models: [{ id: "accounts/fireworks/models/llama4-maverick-instruct-basic", runtimePreset: "chat" }],
  },
  {
    id: "deepseek",
    models: [
      { id: "accounts/fireworks/models/deepseek-v3p1", runtimePreset: "chat" },
      { id: "accounts/fireworks/models/deepseek-v3p2", runtimePreset: "chat" },
    ],
  },
  {
    id: "other",
    models: [
      { id: "accounts/fireworks/models/gpt-oss-120b", runtimePreset: "chat" },
      { id: "accounts/fireworks/models/kimi-k2p5", runtimePreset: "chat" },
      { id: "accounts/fireworks/models/glm-5", runtimePreset: "chat" },
    ],
  },
  {
    id: "perplexity",
    models: [
      { id: "sonar", runtimePreset: "chat" },
      { id: "sonar-pro", runtimePreset: "chat" },
    ],
  },
];

beforeAll(async () => {
  setupProviderTestEnv();
  ({ getProvidersPublic, countModels } = await import("../src/lib/backend/providers"));
});

afterAll(() => {
  restoreProviderTestEnv();
});

describe("providers config invariants", () => {
  it("keeps model ids globally unique", () => {
    const models = getProvidersPublic().flatMap((provider) => provider.models);
    const ids = models.map((model) => model.id);
    const uniqueIds = new Set(ids);

    expect(models.length).toBeGreaterThan(0);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("declares runtime preset for every model", () => {
    const models = getProvidersPublic().flatMap((provider) => provider.models);
    const modelsWithoutPreset = models.filter((model) => model.runtimePreset === undefined);

    expect(modelsWithoutPreset).toHaveLength(0);
  });

  it("uses responses preset only for xAI models", () => {
    const responsesModels = getProvidersPublic().flatMap((provider) =>
      provider.models
        .filter((model) => model.runtimePreset === "responses")
        .map((model) => ({ providerId: provider.id, modelId: model.id }))
    );

    expect(responsesModels.length).toBeGreaterThan(0);
    expect(responsesModels.every((model) => model.providerId === "xai")).toBe(true);
  });

  it("keeps positive cost values", () => {
    const models = getProvidersPublic().flatMap((provider) => provider.models);

    expect(models.every((model) => model.cost > 0)).toBe(true);
  });

  it("matches public model count helper", () => {
    const models = getProvidersPublic().flatMap((provider) => provider.models);

    expect(countModels()).toBe(models.length);
  });

  it("matches provider catalog shape snapshot", () => {
    const catalogShape = getProvidersPublic().map((provider) => ({
      id: provider.id,
      models: provider.models.map((model) => ({
        id: model.id,
        runtimePreset: model.runtimePreset,
      })),
    }));

    expect(catalogShape).toEqual(expectedCatalogShape);
  });
});
