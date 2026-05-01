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
  it("orders by sequence first, with id as deterministic tiebreaker", () => {
    expect(MESSAGE_ORDER_ASC).toEqual([{ sequence: "asc" }, { id: "asc" }]);
    expect(MESSAGE_ORDER_DESC).toEqual([{ sequence: "desc" }, { id: "desc" }]);
  });

  it("builds up-to predicate using sequence", () => {
    const createdAt = new Date("2026-02-28T10:00:00.000Z");
    expect(whereMessagesUpToAnchor({ sequence: 42, createdAt })).toEqual({
      sequence: { lte: 42 },
    });
  });

  it("builds after predicate using sequence", () => {
    const createdAt = new Date("2026-02-28T10:00:00.000Z");
    expect(whereMessagesAfterAnchor({ sequence: 42, createdAt })).toEqual({
      sequence: { gt: 42 },
    });
  });
});
