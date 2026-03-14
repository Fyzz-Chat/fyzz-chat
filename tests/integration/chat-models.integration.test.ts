import { beforeAll, describe, expect, mock, test } from "bun:test";
import {
  CONCURRENCY,
  chatWithModel,
  getProviders,
  initSession,
  logResult,
  logSummary,
  MODEL_FILTER,
  type ReasoningEffort,
  runWithConcurrency,
  type TestResult,
  throwOnFailures,
} from "./helpers";

mock.module("server-only", () => ({}));

const RUN_INTEGRATION = process.env.RUN_INTEGRATION === "true";

describe.skipIf(!RUN_INTEGRATION)("Chat API - all models integration", () => {
  beforeAll(initSession);

  test("at least one provider is configured", () => {
    expect(getProviders().length).toBeGreaterThan(0);
  });

  test("all models respond without errors", async () => {
    let models = getProviders().flatMap((p) =>
      p.models.map((m) => ({ providerId: p.id, model: m }))
    );
    if (MODEL_FILTER) {
      models = models.filter((m) => m.model.id === MODEL_FILTER);
      expect(models.length).toBeGreaterThan(0);
    }

    const tasks = models.map(({ model }) => async (): Promise<TestResult> => {
      const label = `${model.name} \x1b[2m(${model.id})\x1b[0m`;
      try {
        const output = await chatWithModel({ modelId: model.id });
        const result: TestResult = { label, modelId: model.id, output };
        logResult(result);
        return result;
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        const result: TestResult = { label, modelId: model.id, error };
        logResult(result);
        return result;
      }
    });

    const results = await runWithConcurrency(tasks, CONCURRENCY);
    logSummary(results);
    throwOnFailures(results);
  }, 600_000);

  test("reasoning models support all effort levels", async () => {
    let reasoningModels = getProviders()
      .flatMap((p) => p.models)
      .filter((m) => m.features?.some((f) => f.name === "Reasoning"));
    if (MODEL_FILTER) {
      reasoningModels = reasoningModels.filter((m) => m.id === MODEL_FILTER);
    }

    if (reasoningModels.length === 0) {
      console.log("  No reasoning models configured, skipping");
      return;
    }

    const efforts: ReasoningEffort[] = ["low", "medium", "high"];
    const tasks = reasoningModels.flatMap((model) =>
      efforts.map((effort) => async (): Promise<TestResult> => {
        const label = `${model.name} \x1b[2m(${model.id})\x1b[0m \x1b[33m[${effort}]\x1b[0m`;
        try {
          const output = await chatWithModel({
            modelId: model.id,
            reasoningEffort: effort,
          });
          const result: TestResult = { label, modelId: model.id, output };
          logResult(result);
          return result;
        } catch (e) {
          const error = e instanceof Error ? e.message : String(e);
          const result: TestResult = { label, modelId: model.id, error };
          logResult(result);
          return result;
        }
      })
    );

    const results = await runWithConcurrency(tasks, CONCURRENCY);
    logSummary(results);
    throwOnFailures(results);
  }, 600_000);
});
