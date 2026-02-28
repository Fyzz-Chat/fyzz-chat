import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { restoreProviderTestEnv, setupProviderTestEnv } from "./providers.test-utils";
import type { CustomMetadata, CustomUIMessage } from "../src/types/chat";

let getModelRuntime: typeof import("../src/lib/backend/providers").getModelRuntime;

beforeAll(async () => {
  setupProviderTestEnv();
  ({ getModelRuntime } = await import("../src/lib/backend/providers"));
});

afterAll(() => {
  restoreProviderTestEnv();
});

function createMessage(
  id: string,
  role: "user" | "assistant",
  metadata?: CustomMetadata
): CustomUIMessage {
  return {
    id,
    role,
    metadata,
    parts: [],
  } as CustomUIMessage;
}

describe("providers runtime behavior", () => {
  it("uses responses runtime behavior for xAI responses models", () => {
    const runtime = getModelRuntime("grok-4-1-fast-non-reasoning", true);
    expect(runtime.runtimePreset).toBe("responses");

    const messages = [
      createMessage("user-1", "user"),
      createMessage("assistant-1", "assistant", {
        createdAt: new Date(),
        providerResponseId: "resp-1",
      }),
      createMessage("user-2", "user"),
    ];

    const selectedMessages = runtime.selectInputMessages(messages);
    expect(selectedMessages).toHaveLength(1);
    expect(selectedMessages[0]?.id).toBe("user-2");

    const providerOptions = runtime.getProviderOptionsFromHistory(messages);
    expect(providerOptions.xai).toEqual({
      store: true,
      previousResponseId: "resp-1",
    });

    const responseMetadata = runtime.decorateAssistantMetadata({
      metadata: undefined,
      responseId: "resp-2",
    });
    expect(responseMetadata.providerResponseId).toBe("resp-2");
    expect(responseMetadata.createdAt).toBeInstanceOf(Date);
  });

  it("uses chat runtime behavior for standard chat models", () => {
    const runtime = getModelRuntime("gpt-4.1-mini", false);
    expect(runtime.runtimePreset).toBe("chat");

    const messages = [
      createMessage("user-1", "user"),
      createMessage("assistant-1", "assistant", {
        createdAt: new Date(),
        providerResponseId: "resp-1",
      }),
      createMessage("user-2", "user"),
    ];

    const selectedMessages = runtime.selectInputMessages(messages);
    expect(selectedMessages).toHaveLength(messages.length);
    expect(selectedMessages.map((message) => message.id)).toEqual(
      messages.map((message) => message.id)
    );

    const providerOptions = runtime.getProviderOptionsFromHistory(messages);
    expect(providerOptions.xai).toEqual({});

    const responseMetadata = runtime.decorateAssistantMetadata({
      metadata: undefined,
      responseId: "resp-2",
    });
    expect(responseMetadata.providerResponseId).toBeUndefined();
    expect(responseMetadata.createdAt).toBeInstanceOf(Date);
  });
});

describe("providers options matrix", () => {
  const messages = [
    createMessage("user-1", "user"),
    createMessage("assistant-1", "assistant", {
      createdAt: new Date(),
      providerResponseId: "resp-1",
    }),
    createMessage("user-2", "user"),
  ];

  it("applies expected provider options per model class", () => {
    const xaiResponses = getModelRuntime("grok-4-1-fast-non-reasoning", true);
    const xaiChat = getModelRuntime("grok-3", true);
    const anthropicReasoning = getModelRuntime("claude-sonnet-4-6", true);
    const anthropicNonReasoning = getModelRuntime("claude-3-haiku-20240307", true);
    const googleReasoning = getModelRuntime("gemini-3.1-pro-preview", true);
    const googleNonReasoning = getModelRuntime("gemini-3-pro-preview", true);
    const openaiReasoning = getModelRuntime("gpt-5", true);
    const openaiNonReasoning = getModelRuntime("gpt-4.1-mini", true);

    expect(xaiResponses.getProviderOptionsFromHistory(messages).xai).toEqual({
      store: true,
      previousResponseId: "resp-1",
    });
    expect(xaiChat.getProviderOptionsFromHistory(messages).xai).toEqual({});

    expect(anthropicReasoning.getProviderOptionsFromHistory(messages).anthropic).toEqual({
      thinking: { type: "enabled", budgetTokens: 5000 },
    });
    expect(anthropicNonReasoning.getProviderOptionsFromHistory(messages).anthropic).toEqual({
      thinking: { type: "disabled" },
    });

    expect(googleReasoning.getProviderOptionsFromHistory(messages).google).toEqual({
      thinkingConfig: {
        thinkingBudget: 8192,
        includeThoughts: true,
      },
    });
    expect(googleNonReasoning.getProviderOptionsFromHistory(messages).google).toEqual({});

    const openaiReasoningOptions = openaiReasoning.getProviderOptionsFromHistory(messages).openai;
    expect(openaiReasoningOptions).toEqual({
      reasoningEffort: "low",
      reasoningSummary: "detailed",
    });

    const openaiNonReasoningOptions =
      openaiNonReasoning.getProviderOptionsFromHistory(messages).openai;
    expect(openaiNonReasoningOptions?.reasoningEffort).toBeUndefined();
    expect(openaiNonReasoningOptions?.reasoningSummary).toBeUndefined();
  });
});

describe("providers tools matrix", () => {
  it("returns expected tool keys for representative models", () => {
    const openaiGeneral = getModelRuntime("gpt-4.1-mini", true).getProviderTools(true);
    expect(openaiGeneral.code_interpreter).toBeDefined();
    expect(openaiGeneral.image_generation).toBeDefined();
    expect(openaiGeneral.web_search).toBeDefined();

    const openaiCodex = getModelRuntime("gpt-5-codex", true).getProviderTools(true);
    expect(openaiCodex.code_interpreter).toBeUndefined();
    expect(openaiCodex.image_generation).toBeUndefined();
    expect(openaiCodex.web_search).toBeDefined();

    const openaiNoSearch = getModelRuntime("gpt-4.1-mini", false).getProviderTools(false);
    expect(openaiNoSearch.web_search).toBeUndefined();
    expect(openaiNoSearch.code_interpreter).toBeDefined();
    expect(openaiNoSearch.image_generation).toBeDefined();

    const anthropicSearch = getModelRuntime("claude-sonnet-4-6", true).getProviderTools(true);
    expect(anthropicSearch.web_search).toBeDefined();

    const googleSearch = getModelRuntime("gemini-3.1-pro-preview", true).getProviderTools(true);
    expect(googleSearch.google_search).toBeDefined();

    const xaiResponsesSearch = getModelRuntime(
      "grok-4-fast-non-reasoning",
      true
    ).getProviderTools(true);
    expect(xaiResponsesSearch.x_search).toBeDefined();
    expect(xaiResponsesSearch.web_search).toBeDefined();

    const xaiChatSearch = getModelRuntime("grok-3", true).getProviderTools(true);
    expect(xaiChatSearch.x_search).toBeUndefined();
    expect(xaiChatSearch.web_search).toBeUndefined();
  });
});
