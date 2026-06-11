import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { isFileUIPart, isReasoningUIPart, isTextUIPart, isToolUIPart } from "ai";
import type { CustomUIMessage } from "../src/types/chat";
import { restoreProviderTestEnv, setupProviderTestEnv } from "./providers.test-utils";

let getModelRuntime: typeof import("../src/lib/backend/providers").getModelRuntime;
let getProviderIdForModel: typeof import("../src/lib/backend/providers").getProviderIdForModel;

beforeAll(async () => {
  setupProviderTestEnv();
  ({ getModelRuntime, getProviderIdForModel } = await import(
    "../src/lib/backend/providers"
  ));
});

afterAll(() => {
  restoreProviderTestEnv();
});

function assistantFrom(
  modelId: string,
  parts: CustomUIMessage["parts"]
): CustomUIMessage {
  return {
    id: `a-${modelId}`,
    role: "assistant",
    parts,
    metadata: { createdAt: new Date(), model: modelId },
  };
}

function userMessage(parts: CustomUIMessage["parts"]): CustomUIMessage {
  return { id: "u", role: "user", parts, metadata: { createdAt: new Date() } };
}

const codexAssistant = () =>
  assistantFrom("gpt-5.3-codex", [
    { type: "reasoning", text: "let me think about this" },
    {
      type: "tool-webSearch",
      toolCallId: "t1",
      state: "output-available",
      input: { query: "x" },
      output: { result: "y" },
    },
    { type: "source-url", sourceId: "s1", url: "https://example.com" },
    { type: "text", text: "Here is the answer." },
  ] as CustomUIMessage["parts"]);

function selectFor(modelId: string, messages: CustomUIMessage[]) {
  return getModelRuntime(modelId).selectInputMessages(messages);
}

describe("provenance sanitizer (selectInputMessages)", () => {
  it("strips foreign-provider reasoning/tool/source parts when switching providers", () => {
    const history = [userMessage([{ type: "text", text: "hi" }]), codexAssistant()];

    const result = selectFor("claude-sonnet-4-5", history);
    const assistant = result.find((m) => m.role === "assistant");

    expect(assistant).toBeDefined();
    expect(assistant?.parts.some(isReasoningUIPart)).toBe(false);
    expect(assistant?.parts.some(isToolUIPart)).toBe(false);
    expect(assistant?.parts.some((p) => p.type === "source-url")).toBe(false);
    expect(assistant?.parts.some(isTextUIPart)).toBe(true);
  });

  it("keeps reasoning/tool parts when staying within the same provider", () => {
    const anthropicAssistant = assistantFrom("claude-sonnet-4-5", [
      { type: "reasoning", text: "internal" },
      {
        type: "tool-webSearch",
        toolCallId: "t1",
        state: "output-available",
        input: {},
        output: {},
      },
      { type: "text", text: "answer" },
    ] as CustomUIMessage["parts"]);

    const result = selectFor("claude-sonnet-4-6", [anthropicAssistant]);
    const assistant = result.find((m) => m.role === "assistant");

    expect(assistant?.parts.some(isReasoningUIPart)).toBe(true);
    expect(assistant?.parts.some(isToolUIPart)).toBe(true);
  });

  it("keeps supported media and drops unsupported media regardless of provenance", () => {
    const history = [
      userMessage([
        { type: "text", text: "files" },
        {
          type: "file",
          mediaType: "image/png",
          url: "https://example.com/a.png",
          filename: "a.png",
        },
        {
          type: "file",
          mediaType: "audio/mp3",
          url: "https://example.com/a.mp3",
          filename: "a.mp3",
        },
      ] as CustomUIMessage["parts"]),
    ];

    const result = selectFor("claude-sonnet-4-5", history);
    const files = result[0].parts.filter(isFileUIPart);

    expect(files.some((f) => f.mediaType === "image/png")).toBe(true);
    expect(files.some((f) => f.mediaType === "audio/mp3")).toBe(false);
  });

  it("never keeps text stripped — text always survives", () => {
    const history = [codexAssistant()];
    const result = selectFor("claude-sonnet-4-5", history);
    const assistant = result.find((m) => m.role === "assistant");

    expect(assistant?.parts.filter(isTextUIPart).map((p) => p.text)).toEqual([
      "Here is the answer.",
    ]);
  });

  it("is non-destructive — does not mutate the stored history", () => {
    const assistant = codexAssistant();
    const original = assistant.parts.length;
    const history = [assistant];

    selectFor("claude-sonnet-4-5", history);

    expect(assistant.parts.length).toBe(original);
  });

  it("maps model ids to their provider id", () => {
    expect(getProviderIdForModel("gpt-5.3-codex")).toBe("openai");
    expect(getProviderIdForModel("claude-sonnet-4-5")).toBe("anthropic");
    expect(getProviderIdForModel("does-not-exist")).toBeUndefined();
    expect(getProviderIdForModel(undefined)).toBeUndefined();
  });
});
