import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { restoreProviderTestEnv, setupProviderTestEnv } from "./providers.test-utils";
import type { CustomUIMessage } from "../src/types/chat";

let filterMessages: typeof import("../src/lib/backend/utils").filterMessages;

beforeAll(async () => {
  setupProviderTestEnv();
  ({ filterMessages } = await import("../src/lib/backend/utils"));
});

afterAll(() => {
  restoreProviderTestEnv();
});

function createMessage(
  id: string,
  role: string,
  parts: Array<{ type: string; [key: string]: unknown }>
): CustomUIMessage {
  return {
    id,
    role,
    parts,
    metadata: { createdAt: new Date() },
  } as CustomUIMessage;
}

describe("filterMessages", () => {
  it("removes tool role messages and tool parts for models without tools", () => {
    const messages = [
      createMessage("user-1", "user", [{ type: "text", text: "Hi" }]),
      createMessage("assistant-1", "assistant", [
        { type: "tool-search", state: "output-available", output: "x" },
        { type: "text", text: "Result summary" },
      ]),
      createMessage("tool-1", "tool", [
        { type: "tool-search", state: "output-available", output: "raw result" },
      ]),
    ];

    const filtered = filterMessages(messages, "sonar");

    expect(filtered.some((message) => (message.role as string) === "tool")).toBe(false);
    expect(
      filtered.some((message) =>
        message.parts.some(
          (part) => part.type === "tool-invocation" || part.type.startsWith("tool-")
        )
      )
    ).toBe(false);
    expect(filtered.some((message) => message.parts.some((part) => part.type === "text"))).toBe(
      true
    );
  });

  it("keeps tool role messages for models with tool support", () => {
    const messages = [
      createMessage("user-1", "user", [{ type: "text", text: "Hi" }]),
      createMessage("tool-1", "tool", [
        { type: "tool-search", state: "output-available", output: "raw result" },
      ]),
    ];

    const filtered = filterMessages(messages, "gpt-4.1-mini");

    expect(filtered.some((message) => (message.role as string) === "tool")).toBe(true);
  });
});
