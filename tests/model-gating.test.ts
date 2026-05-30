import { describe, expect, it } from "bun:test";
import { effectiveMaxModelCost, isModelGated } from "../src/lib/model-gating";

describe("effectiveMaxModelCost", () => {
  it("returns null (no limit) when gating is disabled, regardless of tier", () => {
    expect(effectiveMaxModelCost("free", false)).toBeNull();
    expect(effectiveMaxModelCost("pro", false)).toBeNull();
    expect(effectiveMaxModelCost("", false)).toBeNull();
  });

  it("caps free users at cost 2 when gating is enabled", () => {
    expect(effectiveMaxModelCost("free", true)).toBe(2);
  });

  it("treats unknown / paid tiers as unlimited (null) when enabled", () => {
    expect(effectiveMaxModelCost("pro", true)).toBeNull();
    expect(effectiveMaxModelCost("team", true)).toBeNull();
    expect(effectiveMaxModelCost("garbage", true)).toBeNull();
    expect(effectiveMaxModelCost("", true)).toBeNull();
  });
});

describe("isModelGated", () => {
  it("never gates when maxCost is null (no limit)", () => {
    for (const cost of [1, 2, 3, 4, 5, 6]) {
      expect(isModelGated(cost, null)).toBe(false);
    }
  });

  it("allows models at or below the cap", () => {
    expect(isModelGated(1, 2)).toBe(false);
    expect(isModelGated(2, 2)).toBe(false); // boundary: equal cost is allowed
  });

  it("gates models above the cap", () => {
    expect(isModelGated(3, 2)).toBe(true);
    expect(isModelGated(6, 2)).toBe(true);
  });
});

describe("gating end-to-end (free tier @ cost 2)", () => {
  const max = effectiveMaxModelCost("free", true);

  it("permits cost 1 and 2, gates cost 3..6", () => {
    expect(isModelGated(1, max)).toBe(false);
    expect(isModelGated(2, max)).toBe(false);
    expect(isModelGated(3, max)).toBe(true);
    expect(isModelGated(4, max)).toBe(true);
    expect(isModelGated(5, max)).toBe(true);
    expect(isModelGated(6, max)).toBe(true);
  });

  it("gates nothing for the same user when the flag is off", () => {
    const off = effectiveMaxModelCost("free", false);
    for (const cost of [1, 2, 3, 4, 5, 6]) {
      expect(isModelGated(cost, off)).toBe(false);
    }
  });
});
