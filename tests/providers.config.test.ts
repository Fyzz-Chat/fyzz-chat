import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import {
  OPENAI_CODE_INTERPRETER_DENYLIST,
  OPENAI_IMAGE_GENERATION_MODELS,
  XAI_SEARCH_TOOLS_MODELS,
} from "./providers.policy.fixtures";
import { restoreProviderTestEnv, setupProviderTestEnv } from "./providers.test-utils";
import type { ProviderId, RuntimePreset } from "../src/types/provider";

let getProvidersPublic: typeof import("../src/lib/backend/providers").getProvidersPublic;
let countModels: typeof import("../src/lib/backend/providers").countModels;

const providerEnvKeys = [
  "OPENAI_API_KEY",
  "XAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "FIREWORKS_API_KEY",
  "PERPLEXITY_API_KEY",
  "AZURE_API_KEY",
  "AZURE_RESOURCE_NAME",
] as const;

type ProviderEnvKey = (typeof providerEnvKeys)[number];

const baselineProviderEnv: Record<ProviderEnvKey, string | undefined> = {
  OPENAI_API_KEY: "test-openai-key",
  XAI_API_KEY: "test-xai-key",
  ANTHROPIC_API_KEY: "test-anthropic-key",
  GOOGLE_GENERATIVE_AI_API_KEY: "test-google-key",
  FIREWORKS_API_KEY: "test-fireworks-key",
  PERPLEXITY_API_KEY: "test-perplexity-key",
  AZURE_API_KEY: undefined,
  AZURE_RESOURCE_NAME: undefined,
};

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
    id: "deepseek",
    models: [
      { id: "accounts/fireworks/models/deepseek-v3p1", runtimePreset: "chat" },
      { id: "accounts/fireworks/models/deepseek-v3p2", runtimePreset: "chat" },
    ],
  },
  {
    id: "other",
    models: [
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

async function getProviderIdsForEnv(
  scenario: string,
  overrides: Partial<Record<ProviderEnvKey, string | undefined>>
): Promise<ProviderId[]> {
  const previous = providerEnvKeys.reduce<Partial<Record<ProviderEnvKey, string | undefined>>>(
    (acc, key) => {
      acc[key] = process.env[key];
      return acc;
    },
    {}
  );

  try {
    const env = { ...baselineProviderEnv, ...overrides };

    for (const key of providerEnvKeys) {
      const value = env[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }

    const module = (await import(
      `../src/lib/backend/providers?provider-availability=${scenario}-${Date.now()}`
    )) as typeof import("../src/lib/backend/providers");

    return module
      .getProvidersPublic()
      .map((provider) => provider.id)
      .sort();
  } finally {
    for (const key of providerEnvKeys) {
      const value = previous[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

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

  it("keeps critical capability flags exact", () => {
    const models = getProvidersPublic().flatMap((provider) => provider.models);

    const codeInterpreterDenied = models
      .filter((model) => model.capabilities?.supportsCodeInterpreter === false)
      .map((model) => model.id)
      .sort();
    expect(codeInterpreterDenied).toEqual([...OPENAI_CODE_INTERPRETER_DENYLIST].sort());

    const imageGenerationEnabled = models
      .filter((model) => model.capabilities?.supportsImageGeneration === true)
      .map((model) => model.id)
      .sort();
    expect(imageGenerationEnabled).toEqual([...OPENAI_IMAGE_GENERATION_MODELS].sort());

    const xaiSearchToolsEnabled = models
      .filter((model) => model.capabilities?.supportsXaiSearchTools === true)
      .map((model) => model.id)
      .sort();
    expect(xaiSearchToolsEnabled).toEqual([...XAI_SEARCH_TOOLS_MODELS].sort());
  });

  it("respects provider availability env matrix", async () => {
    const allAvailable = await getProviderIdsForEnv("all-enabled", {});
    expect(allAvailable).toEqual([
      "anthropic",
      "deepseek",
      "google",
      "openai",
      "other",
      "perplexity",
      "xai",
    ]);

    const matrix: {
      scenario: string;
      overrides: Partial<Record<ProviderEnvKey, string | undefined>>;
      missing: ProviderId[];
    }[] = [
      {
        scenario: "no-openai",
        overrides: { OPENAI_API_KEY: undefined },
        missing: ["openai"],
      },
      {
        scenario: "no-anthropic",
        overrides: { ANTHROPIC_API_KEY: undefined },
        missing: ["anthropic"],
      },
      {
        scenario: "no-google",
        overrides: { GOOGLE_GENERATIVE_AI_API_KEY: undefined },
        missing: ["google"],
      },
      {
        scenario: "no-xai",
        overrides: { XAI_API_KEY: undefined },
        missing: ["xai"],
      },
      {
        scenario: "no-fireworks",
        overrides: { FIREWORKS_API_KEY: undefined },
        missing: ["llama", "deepseek", "other"],
      },
      {
        scenario: "no-perplexity",
        overrides: { PERPLEXITY_API_KEY: undefined },
        missing: ["perplexity"],
      },
    ];

    for (const testCase of matrix) {
      const providerIds = await getProviderIdsForEnv(testCase.scenario, testCase.overrides);
      for (const providerId of testCase.missing) {
        expect(providerIds).not.toContain(providerId);
      }
    }

    const azurePreferred = await getProviderIdsForEnv("azure-priority", {
      AZURE_API_KEY: "test-azure-key",
      AZURE_RESOURCE_NAME: "test-azure-resource",
    });
    expect(azurePreferred).not.toContain("openai");
  });
});
