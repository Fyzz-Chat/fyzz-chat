import { describe, expect, it } from "bun:test";
import { isOwnedFileKey } from "../src/lib/backend/file-access";

describe("isOwnedFileKey", () => {
  const userId = "user_123";

  it("accepts a key under the user's own prefix", () => {
    expect(isOwnedFileKey(`${userId}/conv_1/file_1`, userId)).toBe(true);
  });

  it("rejects another user's key", () => {
    expect(isOwnedFileKey("user_999/conv_1/file_1", userId)).toBe(false);
  });

  it("rejects path-traversal segments even under the own prefix", () => {
    expect(isOwnedFileKey(`${userId}/../user_999/conv/file`, userId)).toBe(false);
  });

  it("rejects empty key or empty userId", () => {
    expect(isOwnedFileKey("", userId)).toBe(false);
    expect(isOwnedFileKey(`${userId}/conv/file`, "")).toBe(false);
  });

  it("rejects a key that contains but does not start with the user id", () => {
    expect(isOwnedFileKey(`other/${userId}/file`, userId)).toBe(false);
  });
});
