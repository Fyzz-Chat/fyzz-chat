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

describe("critical model policy: runtime classification", () => {
  it("keeps runtime preset and supportsTools policy for critical models", () => {
    const cases: {
      modelId: string;
      runtimePreset: "chat" | "responses";
      supportsTools: boolean;
    }[] = [
      { modelId: "grok-4-0709", runtimePreset: "responses", supportsTools: true },
      {
        modelId: "grok-4-fast-non-reasoning",
        runtimePreset: "responses",
        supportsTools: true,
      },
      {
        modelId: "grok-4-1-fast-non-reasoning",
        runtimePreset: "responses",
        supportsTools: true,
      },
      { modelId: "grok-3", runtimePreset: "chat", supportsTools: true },
      { modelId: "grok-code-fast-1", runtimePreset: "chat", supportsTools: true },
      { modelId: "gpt-5-codex", runtimePreset: "chat", supportsTools: true },
      { modelId: "gpt-5.1-codex", runtimePreset: "chat", supportsTools: true },
      { modelId: "gpt-5.2-codex", runtimePreset: "chat", supportsTools: true },
      { modelId: "gpt-5.3-codex", runtimePreset: "chat", supportsTools: true },
      { modelId: "o3-mini", runtimePreset: "chat", supportsTools: true },
      { modelId: "claude-sonnet-4-6", runtimePreset: "chat", supportsTools: true },
      { modelId: "gemini-3.1-pro-preview", runtimePreset: "chat", supportsTools: true },
      { modelId: "gemini-2.5-flash-lite", runtimePreset: "chat", supportsTools: false },
      { modelId: "gemini-2.5-flash-image", runtimePreset: "chat", supportsTools: false },
      { modelId: "gemma-3-27b-it", runtimePreset: "chat", supportsTools: false },
      { modelId: "sonar", runtimePreset: "chat", supportsTools: false },
      { modelId: "sonar-pro", runtimePreset: "chat", supportsTools: false },
    ];

    for (const testCase of cases) {
      const runtime = getModelRuntime(testCase.modelId, true);
      expect(runtime.runtimePreset).toBe(testCase.runtimePreset);
      expect(runtime.supportsTools).toBe(testCase.supportsTools);
    }
  });
});

describe("critical model policy: provider options", () => {
  const messages = [
    createMessage("user-1", "user"),
    createMessage("assistant-1", "assistant", {
      createdAt: new Date(),
      providerResponseId: "resp-1",
    }),
    createMessage("user-2", "user"),
  ];

  it("keeps xAI responses threading only on responses models", () => {
    const xaiResponsesModels = [
      "grok-4-0709",
      "grok-4-fast-non-reasoning",
      "grok-4-1-fast-non-reasoning",
    ];

    for (const modelId of xaiResponsesModels) {
      expect(getModelRuntime(modelId, true).getProviderOptionsFromHistory(messages).xai).toEqual({
        store: true,
        previousResponseId: "resp-1",
      });
    }

    const xaiChatModels = ["grok-3", "grok-code-fast-1"];

    for (const modelId of xaiChatModels) {
      expect(getModelRuntime(modelId, true).getProviderOptionsFromHistory(messages).xai).toEqual(
        {}
      );
    }
  });

  it("keeps reasoning provider options for reasoning and non-reasoning models", () => {
    const openaiReasoningModels = ["gpt-5", "gpt-5-codex"];
    for (const modelId of openaiReasoningModels) {
      expect(
        getModelRuntime(modelId, true).getProviderOptionsFromHistory(messages).openai
      ).toEqual({
        reasoningEffort: "low",
        reasoningSummary: "detailed",
      });
    }

    const openaiNonReasoning = getModelRuntime("gpt-4.1-mini", true).getProviderOptionsFromHistory(
      messages
    ).openai;
    expect(openaiNonReasoning?.reasoningEffort).toBeUndefined();
    expect(openaiNonReasoning?.reasoningSummary).toBeUndefined();

    expect(
      getModelRuntime("claude-sonnet-4-6", true).getProviderOptionsFromHistory(messages).anthropic
    ).toEqual({
      thinking: { type: "enabled", budgetTokens: 5000 },
    });
    expect(
      getModelRuntime("claude-3-haiku-20240307", true).getProviderOptionsFromHistory(messages)
        .anthropic
    ).toEqual({
      thinking: { type: "disabled" },
    });

    expect(
      getModelRuntime("gemini-3.1-pro-preview", true).getProviderOptionsFromHistory(messages)
        .google
    ).toEqual({
      thinkingConfig: {
        thinkingBudget: 8192,
        includeThoughts: true,
      },
    });
    expect(
      getModelRuntime("gemini-3-pro-preview", true).getProviderOptionsFromHistory(messages).google
    ).toEqual({});
  });
});

describe("critical model policy: tool behavior", () => {
  it("keeps OpenAI code interpreter denylist intact", () => {
    const modelsWithoutCodeInterpreter = [
      "gpt-5-codex",
      "gpt-5.1-codex",
      "gpt-5.2-codex",
      "gpt-5.3-codex",
      "o3-mini",
    ];

    for (const modelId of modelsWithoutCodeInterpreter) {
      expect(getModelRuntime(modelId, true).getProviderTools(true).code_interpreter).toBeUndefined();
    }
  });

  it("keeps key cross-provider tool policies", () => {
    const openaiGeneral = getModelRuntime("gpt-4.1-mini", true).getProviderTools(true);
    expect(openaiGeneral.code_interpreter).toBeDefined();
    expect(openaiGeneral.image_generation).toBeDefined();
    expect(openaiGeneral.web_search).toBeDefined();

    const openaiReasoningNoImage = getModelRuntime("gpt-5", true).getProviderTools(true);
    expect(openaiReasoningNoImage.image_generation).toBeUndefined();

    const xaiResponsesModels = [
      "grok-4-0709",
      "grok-4-fast-non-reasoning",
      "grok-4-1-fast-non-reasoning",
    ];
    for (const modelId of xaiResponsesModels) {
      const tools = getModelRuntime(modelId, true).getProviderTools(true);
      expect(tools.x_search).toBeDefined();
      expect(tools.web_search).toBeDefined();
    }

    const xaiResponsesNoSearch = getModelRuntime("grok-4-1-fast-non-reasoning", false).getProviderTools(
      false
    );
    expect(xaiResponsesNoSearch.x_search).toBeUndefined();
    expect(xaiResponsesNoSearch.web_search).toBeUndefined();

    const xaiChatModels = ["grok-3", "grok-code-fast-1"];
    for (const modelId of xaiChatModels) {
      const tools = getModelRuntime(modelId, true).getProviderTools(true);
      expect(tools.x_search).toBeUndefined();
      expect(tools.web_search).toBeUndefined();
    }

    expect(getModelRuntime("claude-sonnet-4-6", true).getProviderTools(true).web_search).toBeDefined();
    expect(getModelRuntime("gemini-3.1-pro-preview", true).getProviderTools(true).google_search).toBeDefined();
  });
});
