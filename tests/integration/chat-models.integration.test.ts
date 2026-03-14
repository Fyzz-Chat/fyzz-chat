import { beforeAll, describe, expect, mock, test } from "bun:test";
import { TEST_PASSWORD, TEST_USER_EMAIL } from "./test-user";

mock.module("server-only", () => ({}));

const RUN_INTEGRATION = process.env.RUN_INTEGRATION === "true";
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

type PublicModel = {
  id: string;
  name: string;
};

type PublicProvider = {
  id: string;
  name: string;
  models: PublicModel[];
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
): Promise<{ ok: boolean; error?: string }> {
  const body = response.body;
  if (!body) {
    return { ok: false, error: "No response body" };
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }

  for (const line of fullText.split("\n")) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === "error") {
        return { ok: false, error: parsed.error || JSON.stringify(parsed) };
      }
    } catch {
      // Not all lines are JSON in the UI message stream protocol
    }
  }

  return { ok: true };
}

async function testModel(modelId: string): Promise<void> {
  const conversationId = crypto.randomUUID();

  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      id: conversationId,
      model: modelId,
      temporaryChat: true,
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

  expect(response.status).toBe(200);

  const streamResult = await consumeStream(response);
  if (!streamResult.ok) {
    throw new Error(`Stream error for ${modelId}: ${streamResult.error}`);
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
    const models = providers.flatMap((p) =>
      p.models.map((m) => ({ providerId: p.id, modelId: m.id, modelName: m.name }))
    );

    const results: Array<{ modelId: string; modelName: string; error?: string }> = [];

    for (const { modelId, modelName } of models) {
      try {
        await testModel(modelId);
        results.push({ modelId, modelName });
        console.log(`  ✓ ${modelName} (${modelId})`);
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        results.push({ modelId, modelName, error });
        console.error(`  ✗ ${modelName} (${modelId}): ${error}`);
      }
    }

    const failures = results.filter((r) => r.error);
    if (failures.length > 0) {
      const summary = failures
        .map((f) => `  ${f.modelName} (${f.modelId}): ${f.error}`)
        .join("\n");
      throw new Error(`${failures.length}/${models.length} models failed:\n${summary}`);
    }
  }, 600_000);
});
