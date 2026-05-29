import { TEST_PASSWORD, TEST_USER_EMAIL } from "./test-user";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
export const CONCURRENCY = 8;
export const MODEL_FILTER = process.env.TEST_MODEL;

export function matchesFilter(modelId: string): boolean {
  if (!MODEL_FILTER) return true;
  return modelId.toLowerCase().includes(MODEL_FILTER.toLowerCase());
}

type PublicModel = {
  id: string;
  name: string;
  features?: Array<{ name: string }>;
  extensions: string[];
  effortLevels?: ReasoningEffort[];
};

export type PublicProvider = {
  id: string;
  name: string;
  models: PublicModel[];
};

type ReasoningEffort = "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";

export type TestResult = {
  label: string;
  modelId: string;
  output?: string;
  error?: string;
};

export type ChatOptions = {
  modelId: string;
  message?: string;
  reasoningEffort?: ReasoningEffort;
  file?: { filename: string; mediaType: string };
};

let sessionCookie: string;
let providers: PublicProvider[];

export async function initSession() {
  const { ensureTestUser } = await import("./setup");
  await ensureTestUser();
  sessionCookie = await signIn();
  providers = await fetchModels();
}

export function getProviders() {
  return providers;
}

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

function readFixtureAsBase64(fixturesDir: string, filename: string): string {
  const path = `${fixturesDir}/${filename}`;
  const buffer = require("node:fs").readFileSync(path);
  return buffer.toString("base64");
}

export async function chatWithModel(opts: ChatOptions): Promise<string> {
  const {
    modelId,
    message = "Reply with the word 'ok' only. This is a test.",
    reasoningEffort,
    file,
  } = opts;

  const parts: Array<Record<string, string>> = [{ type: "text", text: message }];
  if (file) {
    parts.push({
      type: "file",
      mediaType: file.mediaType,
      filename: file.filename,
      url: readFixtureAsBase64(`${import.meta.dir}/fixtures`, file.filename),
    });
  }

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
          parts,
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

export async function runWithConcurrency<T>(
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

export function logResult(result: TestResult) {
  const preview = result.output?.replaceAll("\n", " ").trim().slice(0, 80) ?? "";
  if (result.error) {
    console.error(`  \x1b[31m✗ ${result.label}: ${result.error}\x1b[0m`);
  } else {
    console.log(`  \x1b[32m✓\x1b[0m ${result.label} \x1b[36m${preview}\x1b[0m`);
  }
}

export function logSummary(results: TestResult[]) {
  const passed = results.filter((r) => !r.error).length;
  const failures = results.filter((r) => r.error);
  console.log(
    `\n  \x1b[1m${passed}/${results.length} passed\x1b[0m` +
      (failures.length > 0 ? `, \x1b[31m${failures.length} failed\x1b[0m` : "")
  );
}

export function throwOnFailures(results: TestResult[]) {
  const failures = results.filter((r) => r.error);
  if (failures.length > 0) {
    const summary = failures
      .map((f) => `  \x1b[31m${f.label}: ${f.error}\x1b[0m`)
      .join("\n");
    throw new Error(`${failures.length}/${results.length} failed:\n${summary}`);
  }
}
