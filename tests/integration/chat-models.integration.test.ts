import { beforeAll, describe, expect, mock, test } from "bun:test";
import { TEST_PASSWORD, TEST_USER_EMAIL } from "./test-user";

mock.module("server-only", () => ({}));

const RUN_INTEGRATION = process.env.RUN_INTEGRATION === "true";
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const CONCURRENCY = 8;
const MODEL_FILTER = process.env.TEST_MODEL;

type PublicModel = {
  id: string;
  name: string;
  features?: Array<{ name: string }>;
};

type PublicProvider = {
  id: string;
  name: string;
  models: PublicModel[];
};

type ReasoningEffort = "low" | "medium" | "high";

type TestResult = {
  label: string;
  modelId: string;
  output?: string;
  error?: string;
};

let sessionCookie: string;
let providers: PublicProvider[];

async function signIn(): Promise<string> {
  const response = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_USER_EMAIL, password: TEST_PASSWORD }),
    redirect: "manual",
  });

  if (!response.ok) {
    throw new Error(`Sign-in failed with status ${response.status}`);
  }

  const cookies = response.headers.getSetCookie();
  const sessionCookies = cookies
    .map((c) => c.split(";")[0])
    .filter((c) => c.startsWith("better-auth"));

  if (sessionCookies.length === 0) {
    throw new Error("No session cookie returned from sign-in");
  }

  return sessionCookies.join("; ");
}

async function fetchModels(): Promise<PublicProvider[]> {
  const response = await fetch(`${BASE_URL}/api/trpc/providers`, {
    headers: { Cookie: sessionCookie },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch providers: ${response.status}`);
  }

  const json = (await response.json()) as {
    result: { data: { json: PublicProvider[] } };
  };
  return json.result.data.json;
}

async function consumeStream(
  response: Response
): Promise<{ ok: boolean; text: string; error?: string }> {
  const body = response.body;
  if (!body) {
    return { ok: false, text: "", error: "No response body" };
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let rawStream = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      rawStream += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }

  let text = "";

  for (const line of rawStream.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data: ")) continue;
    try {
      const parsed = JSON.parse(trimmed.slice(6));
      if (parsed.type === "error") {
        return { ok: false, text, error: parsed.error || JSON.stringify(parsed) };
      }
      if (parsed.type === "text-delta") {
        text += parsed.delta ?? parsed.textDelta ?? "";
      }
    } catch {
      // Not all SSE lines are valid JSON
    }
  }

  return { ok: true, text };
}

async function chatWithModel(
  modelId: string,
  reasoningEffort?: ReasoningEffort
): Promise<string> {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      model: modelId,
      temporaryChat: true,
      reasoningEffort,
      messages: [
        {
          id: crypto.randomUUID(),
          role: "user",
          parts: [
            { type: "text", text: "Reply with the word 'ok' only. This is a test." },
          ],
          createdAt: new Date().toISOString(),
        },
      ],
    }),
  });

  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status}`);
  }

  const streamResult = await consumeStream(response);
  if (!streamResult.ok) {
    throw new Error(streamResult.error);
  }

  return streamResult.text;
}

async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker())
  );
  return results;
}

function logResult(result: TestResult) {
  const preview = result.output?.replaceAll("\n", " ").trim().slice(0, 80) ?? "";
  if (result.error) {
    console.error(`  \x1b[31m✗ ${result.label}: ${result.error}\x1b[0m`);
  } else {
    console.log(`  \x1b[32m✓\x1b[0m ${result.label} \x1b[36m${preview}\x1b[0m`);
  }
}

function logSummary(results: TestResult[]) {
  const passed = results.filter((r) => !r.error).length;
  const failures = results.filter((r) => r.error);
  console.log(
    `\n  \x1b[1m${passed}/${results.length} passed\x1b[0m` +
      (failures.length > 0 ? `, \x1b[31m${failures.length} failed\x1b[0m` : "")
  );
}

function throwOnFailures(results: TestResult[]) {
  const failures = results.filter((r) => r.error);
  if (failures.length > 0) {
    const summary = failures
      .map((f) => `  \x1b[31m${f.label}: ${f.error}\x1b[0m`)
      .join("\n");
    throw new Error(`${failures.length}/${results.length} failed:\n${summary}`);
  }
}

describe.skipIf(!RUN_INTEGRATION)("Chat API - all models integration", () => {
  beforeAll(async () => {
    const { ensureTestUser } = await import("./setup");
    await ensureTestUser();
    sessionCookie = await signIn();
    providers = await fetchModels();
  });

  test("at least one provider is configured", () => {
    expect(providers.length).toBeGreaterThan(0);
  });

  test("all models respond without errors", async () => {
    let models = providers.flatMap((p) =>
      p.models.map((m) => ({ providerId: p.id, model: m }))
    );
    if (MODEL_FILTER) {
      models = models.filter((m) => m.model.id === MODEL_FILTER);
      expect(models.length).toBeGreaterThan(0);
    }

    const tasks = models.map(({ model }) => async (): Promise<TestResult> => {
      const label = `${model.name} \x1b[2m(${model.id})\x1b[0m`;
      try {
        const output = await chatWithModel(model.id);
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
    let reasoningModels = providers
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
          const output = await chatWithModel(model.id, effort);
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
