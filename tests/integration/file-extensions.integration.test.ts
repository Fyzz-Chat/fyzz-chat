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

const FILE_FIXTURES: Array<{ filename: string; mediaType: string }> = [
  { filename: "test.png", mediaType: "image/png" },
  { filename: "test.jpg", mediaType: "image/jpeg" },
  { filename: "test.jpeg", mediaType: "image/jpeg" },
  { filename: "test.webp", mediaType: "image/webp" },
  { filename: "test.pdf", mediaType: "application/pdf" },
];

describe.skipIf(!RUN_INTEGRATION)("Chat API - file extensions", () => {
  beforeAll(initSession);

  test("at least one model supports file uploads", () => {
    const testedTypes = FILE_FIXTURES.map((f) => f.mediaType);
    const models = getProviders()
      .flatMap((p) => p.models)
      .filter((m) => m.extensions.some((ext) => testedTypes.includes(ext)));
    expect(models.length).toBeGreaterThan(0);
  });

  test("models accept their declared file extensions", async () => {
    const testedTypes = FILE_FIXTURES.map((f) => f.mediaType);
    let models = getProviders()
      .flatMap((p) => p.models)
      .filter((m) => m.extensions.some((ext) => testedTypes.includes(ext)));
    if (MODEL_FILTER) {
      models = models.filter((m) => matchesFilter(m.id));
    }

    if (models.length === 0) {
      console.log("  No models with testable file extensions, skipping");
      return;
    }

    const tasks = models.flatMap((model) => {
      const supported = FILE_FIXTURES.filter((f) =>
        model.extensions.includes(f.mediaType)
      );
      return supported.map((file) => async (): Promise<TestResult> => {
        const label = `${model.name} \x1b[2m(${model.id})\x1b[0m \x1b[35m[${file.filename}]\x1b[0m`;
        try {
          const output = await chatWithModel({
            modelId: model.id,
            message: "Return a single word you can find in this file, nothing else.",
            file,
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
      });
    });

    const results = await runWithConcurrency(tasks, CONCURRENCY);
    logSummary(results);
    throwOnFailures(results);
  }, 600_000);
});
