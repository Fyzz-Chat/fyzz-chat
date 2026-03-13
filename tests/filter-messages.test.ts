import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { LanguageModelV3Message } from "@ai-sdk/provider";
import { restoreProviderTestEnv, setupProviderTestEnv } from "./providers.test-utils";

let messageFilterMiddleware: typeof import("../src/lib/backend/message-filter-middleware").messageFilterMiddleware;

beforeAll(async () => {
  setupProviderTestEnv();
  ({ messageFilterMiddleware } = await import(
    "../src/lib/backend/message-filter-middleware"
  ));
});

afterAll(() => {
  restoreProviderTestEnv();
});

async function applyMiddleware(modelId: string, prompt: LanguageModelV3Message[]) {
  const middleware = messageFilterMiddleware(modelId);
  const params = {
    prompt,
    maxOutputTokens: undefined,
    temperature: undefined,
    topP: undefined,
    topK: undefined,
    presencePenalty: undefined,
    frequencyPenalty: undefined,
    seed: undefined,
    stopSequences: undefined,
    responseFormat: undefined,
    tools: undefined,
    toolChoice: undefined,
  } as Parameters<NonNullable<typeof middleware.transformParams>>[0]["params"];

  if (!middleware.transformParams) {
    throw new Error("transformParams is not defined");
  }

  const result = await middleware.transformParams({
    params,
    type: "generate",
    model: {} as never,
  });

  return result.prompt;
}

describe("messageFilterMiddleware", () => {
  it("removes tool role messages and tool parts for models without tools", async () => {
    const prompt: LanguageModelV3Message[] = [
      { role: "user", content: [{ type: "text", text: "Hi" }] },
      {
        role: "assistant",
        content: [
          {
            type: "tool-call",
            toolCallId: "1",
            toolName: "search",
            input: {},
          },
          { type: "text", text: "Result summary" },
        ],
      },
      {
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: "1",
            toolName: "search",
            output: { type: "text", value: "raw result" },
          },
        ],
      },
    ];

    const filtered = await applyMiddleware("sonar", prompt);

    expect(filtered.some((m) => m.role === "tool")).toBe(false);
    expect(
      filtered.some(
        (m) =>
          m.role === "assistant" &&
          Array.isArray(m.content) &&
          m.content.some((p) => p.type === "tool-call")
      )
    ).toBe(false);
    expect(
      filtered.some(
        (m) =>
          m.role === "assistant" &&
          Array.isArray(m.content) &&
          m.content.some((p) => p.type === "text")
      )
    ).toBe(true);
  });

  it("keeps tool role messages for models with tool support", async () => {
    const prompt: LanguageModelV3Message[] = [
      { role: "user", content: [{ type: "text", text: "Hi" }] },
      {
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: "1",
            toolName: "search",
            output: { type: "text", value: "raw result" },
          },
        ],
      },
    ];

    const filtered = await applyMiddleware("gpt-4.1-mini", prompt);

    expect(filtered.some((m) => m.role === "tool")).toBe(true);
  });
});
