import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";
import type { CustomMetadata, CustomUIMessage } from "../src/types/chat";

mock.module("server-only", () => ({}));

const originalEnv = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  XAI_API_KEY: process.env.XAI_API_KEY,
  AZURE_API_KEY: process.env.AZURE_API_KEY,
  AZURE_RESOURCE_NAME: process.env.AZURE_RESOURCE_NAME,
};

let getModelRuntime: typeof import("../src/lib/backend/providers").getModelRuntime;
let getProvidersPublic: typeof import("../src/lib/backend/providers").getProvidersPublic;

beforeAll(async () => {
  process.env.OPENAI_API_KEY = "test-openai-key";
  process.env.XAI_API_KEY = "test-xai-key";
  delete process.env.AZURE_API_KEY;
  delete process.env.AZURE_RESOURCE_NAME;

  ({ getModelRuntime, getProvidersPublic } = await import("../src/lib/backend/providers"));
});

afterAll(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
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

describe("model runtime smoke tests", () => {
  it("ensures all configured models declare a runtime preset", () => {
    const models = getProvidersPublic().flatMap((provider) => provider.models);
    const modelsWithoutPreset = models.filter((model) => model.runtimePreset === undefined);

    expect(models.length).toBeGreaterThan(0);
    expect(modelsWithoutPreset).toHaveLength(0);
  });

  it("uses provider-only runtime behavior for xAI responses models", async () => {
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

    const providerTools = runtime.getProviderTools(true);
    expect(providerTools.x_search).toBeDefined();
    expect(providerTools.web_search).toBeDefined();
  });

  it("uses hybrid runtime behavior for normal chat models", () => {
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
