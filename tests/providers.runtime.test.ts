import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import {
  OPENAI_CODE_INTERPRETER_DENYLIST,
  OPENAI_REASONING_MODELS,
  TOOLS_DISABLED_MODELS,
  XAI_CHAT_MODELS,
  XAI_RESPONSES_MODELS,
} from "./providers.policy.fixtures";
import { restoreProviderTestEnv, setupProviderTestEnv } from "./providers.test-utils";
import type { CustomMetadata, CustomUIMessage } from "../src/types/chat";

let getModelRuntime: typeof import("../src/lib/backend/providers").getModelRuntime;

const XAI_RESPONSES_THREADING_OPTIONS = {
  store: true,
  previousResponseId: "resp-1",
} as const;

const CRITICAL_RUNTIME_CASES: {
  modelId: string;
  runtimePreset: "chat" | "responses";
  supportsTools: boolean;
}[] = [
  ...XAI_RESPONSES_MODELS.map((modelId) => ({
    modelId,
    runtimePreset: "responses" as const,
    supportsTools: true,
  })),
  ...XAI_CHAT_MODELS.map((modelId) => ({
    modelId,
    runtimePreset: "chat" as const,
    supportsTools: true,
  })),
  ...OPENAI_CODE_INTERPRETER_DENYLIST.map((modelId) => ({
    modelId,
    runtimePreset: "chat" as const,
    supportsTools: true,
  })),
  { modelId: "claude-sonnet-4-6", runtimePreset: "chat", supportsTools: true },
  { modelId: "gemini-3.1-pro-preview", runtimePreset: "chat", supportsTools: true },
  ...TOOLS_DISABLED_MODELS.map((modelId) => ({
    modelId,
    runtimePreset: "chat" as const,
    supportsTools: false,
  })),
];

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
    expect(providerOptions.xai).toEqual(XAI_RESPONSES_THREADING_OPTIONS);

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
    for (const testCase of CRITICAL_RUNTIME_CASES) {
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
    for (const modelId of XAI_RESPONSES_MODELS) {
      expect(getModelRuntime(modelId, true).getProviderOptionsFromHistory(messages).xai).toEqual(
        XAI_RESPONSES_THREADING_OPTIONS
      );
    }

    for (const modelId of XAI_CHAT_MODELS) {
      expect(getModelRuntime(modelId, true).getProviderOptionsFromHistory(messages).xai).toEqual(
        {}
      );
    }
  });

  it("keeps reasoning provider options for reasoning and non-reasoning models", () => {
    for (const modelId of OPENAI_REASONING_MODELS) {
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
    for (const modelId of OPENAI_CODE_INTERPRETER_DENYLIST) {
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

    for (const modelId of XAI_RESPONSES_MODELS) {
      const tools = getModelRuntime(modelId, true).getProviderTools(true);
      expect(tools.x_search).toBeDefined();
      expect(tools.web_search).toBeDefined();
    }

    const xaiResponsesNoSearch = getModelRuntime("grok-4-1-fast-non-reasoning", false).getProviderTools(
      false
    );
    expect(xaiResponsesNoSearch.x_search).toBeUndefined();
    expect(xaiResponsesNoSearch.web_search).toBeUndefined();

    for (const modelId of XAI_CHAT_MODELS) {
      const tools = getModelRuntime(modelId, true).getProviderTools(true);
      expect(tools.x_search).toBeUndefined();
      expect(tools.web_search).toBeUndefined();
    }

    expect(getModelRuntime("claude-sonnet-4-6", true).getProviderTools(true).web_search).toBeDefined();
    expect(getModelRuntime("gemini-3.1-pro-preview", true).getProviderTools(true).google_search).toBeDefined();
  });
});
