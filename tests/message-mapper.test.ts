import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";
import type { CustomUIMessage, PartialMessage } from "../src/types/chat";

mock.module("server-only", () => ({}));

let mapFilePartsForRead: typeof import("../src/lib/backend/message-mapper").mapFilePartsForRead;
let mapMessageFilePartsForRead: typeof import("../src/lib/backend/message-mapper").mapMessageFilePartsForRead;
let mapDbMessageToUiMessage: typeof import("../src/lib/backend/message-mapper").mapDbMessageToUiMessage;
let mapDbMessagesToUiMessages: typeof import("../src/lib/backend/message-mapper").mapDbMessagesToUiMessages;

beforeAll(async () => {
  mock.module("@/lib/aws/s3", () => ({
    getFileUrlSigned: (prefix: string, fileUrl: string) =>
      `signed://${prefix}/${fileUrl}`,
  }));

  ({
    mapFilePartsForRead,
    mapMessageFilePartsForRead,
    mapDbMessageToUiMessage,
    mapDbMessagesToUiMessages,
  } = await import("../src/lib/backend/message-mapper"));
});

afterAll(() => {
  mock.restore();
});

function createDbMessage(overrides: Partial<PartialMessage> = {}): PartialMessage {
  return {
    id: "msg-1",
    role: "assistant",
    content: "hello",
    parts: [{ type: "text", text: "hello" }],
    metadata: {
      createdAt: "2026-02-28T10:00:00.000Z",
      content: "hello",
      model: "grok-4-1-fast-non-reasoning",
    },
    createdAt: new Date("2026-02-28T10:00:00.000Z"),
    sequence: 1,
    ...overrides,
  } as PartialMessage;
}

describe("message mapper", () => {
  it("does not sign data URL file parts", () => {
    const parts = [
      { type: "file", url: "data:image/png;base64,abc", mediaType: "image/png" },
      { type: "text", text: "hello" },
    ] as CustomUIMessage["parts"];

    const mapped = mapFilePartsForRead("user-1", "conv-1", parts);
    expect(mapped).toEqual(parts);
  });

  it("signs persisted file key URLs", () => {
    const parts = [
      { type: "file", url: "files/image.png", mediaType: "image/png" },
    ] as CustomUIMessage["parts"];

    const mapped = mapFilePartsForRead("user-1", "conv-1", parts);
    expect(mapped?.[0]).toMatchObject({
      type: "file",
      url: "signed://user-1/conv-1/files/image.png",
    });
  });

  it("maps a full message without manual spread at callsites", () => {
    const message = {
      id: "msg-1",
      role: "user",
      parts: [{ type: "file", url: "files/image.png", mediaType: "image/png" }],
      metadata: {
        createdAt: new Date("2026-02-28T10:00:00.000Z"),
      },
    } as CustomUIMessage;

    const mapped = mapMessageFilePartsForRead("user-1", "conv-1", message);
    expect(mapped.id).toBe("msg-1");
    expect(mapped.parts?.[0]).toMatchObject({
      type: "file",
      url: "signed://user-1/conv-1/files/image.png",
    });
  });

  it("falls back metadata when invalid", () => {
    const createdAt = new Date("2026-02-28T11:00:00.000Z");
    const message = createDbMessage({
      content: "fallback content",
      createdAt,
      metadata: { invalid: true } as unknown as PartialMessage["metadata"],
    });

    const mapped = mapDbMessageToUiMessage("user-1", "conv-1", message);
    expect(mapped.metadata?.content).toBe("fallback content");
    expect(mapped.metadata?.createdAt?.toISOString()).toBe(createdAt.toISOString());
  });

  it("maps DB message collections to a consistent UI shape", () => {
    const mapped = mapDbMessagesToUiMessages("user-1", "conv-1", [
      createDbMessage({ id: "msg-1", parts: [{ type: "text", text: "one" }] }),
      createDbMessage({
        id: "msg-2",
        parts: [{ type: "file", url: "files/two.png", mediaType: "image/png" }],
      }),
    ]);

    expect(mapped).toHaveLength(2);
    expect(mapped.map((message) => message.id)).toEqual(["msg-1", "msg-2"]);
    expect(mapped[1]?.parts?.[0]).toMatchObject({
      type: "file",
      url: "signed://user-1/conv-1/files/two.png",
    });
  });
});
