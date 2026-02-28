import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { restoreProviderTestEnv, setupProviderTestEnv } from "./providers.test-utils";

let getProvidersPublic: typeof import("../src/lib/backend/providers").getProvidersPublic;
let countModels: typeof import("../src/lib/backend/providers").countModels;

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
});
