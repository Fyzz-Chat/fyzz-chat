import { beforeAll, describe, expect, it, mock } from "bun:test";

mock.module("server-only", () => ({}));

let MESSAGE_ORDER_ASC: typeof import("../src/lib/dao/message-order").MESSAGE_ORDER_ASC;
let MESSAGE_ORDER_DESC: typeof import("../src/lib/dao/message-order").MESSAGE_ORDER_DESC;
let whereMessagesUpToAnchor: typeof import("../src/lib/dao/message-order").whereMessagesUpToAnchor;
let whereMessagesAfterAnchor: typeof import("../src/lib/dao/message-order").whereMessagesAfterAnchor;

beforeAll(async () => {
  ({
    MESSAGE_ORDER_ASC,
    MESSAGE_ORDER_DESC,
    whereMessagesUpToAnchor,
    whereMessagesAfterAnchor,
  } = await import("../src/lib/dao/message-order"));
});

describe("message order policy", () => {
  it("keeps ascending and descending order constants stable", () => {
    expect(MESSAGE_ORDER_ASC).toEqual([
      { createdAt: "asc" },
      { sequence: "asc" },
      { id: "asc" },
    ]);
    expect(MESSAGE_ORDER_DESC).toEqual([
      { createdAt: "desc" },
      { sequence: "desc" },
      { id: "desc" },
    ]);
  });

  it("builds up-to predicate with createdAt fallback when sequence is null", () => {
    const createdAt = new Date("2026-02-28T10:00:00.000Z");
    expect(whereMessagesUpToAnchor({ sequence: null, createdAt })).toEqual({
      createdAt: {
        lte: createdAt,
      },
    });
  });

  it("builds up-to predicate using sequence with createdAt fallback", () => {
    const createdAt = new Date("2026-02-28T10:00:00.000Z");
    expect(whereMessagesUpToAnchor({ sequence: 42, createdAt })).toEqual({
      OR: [
        {
          sequence: {
            lte: 42,
          },
        },
        {
          sequence: null,
          createdAt: {
            lte: createdAt,
          },
        },
      ],
    });
  });

  it("builds after predicate with createdAt fallback when sequence is null", () => {
    const createdAt = new Date("2026-02-28T10:00:00.000Z");
    expect(whereMessagesAfterAnchor({ sequence: null, createdAt })).toEqual({
      createdAt: {
        gt: createdAt,
      },
    });
  });

  it("builds after predicate using sequence with createdAt fallback", () => {
    const createdAt = new Date("2026-02-28T10:00:00.000Z");
    expect(whereMessagesAfterAnchor({ sequence: 42, createdAt })).toEqual({
      OR: [
        {
          sequence: {
            gt: 42,
          },
        },
        {
          sequence: null,
          createdAt: {
            gt: createdAt,
          },
        },
      ],
    });
  });
});
