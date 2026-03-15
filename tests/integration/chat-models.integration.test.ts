import { beforeAll, describe, expect, mock, test } from "bun:test";
import {
  CONCURRENCY,
  chatWithModel,
  getProviders,
  initSession,
  logResult,
  logSummary,
  MODEL_FILTER,
  matchesFilter,
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
      models = models.filter((m) => matchesFilter(m.model.id));
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
});
