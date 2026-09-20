import { describe, expect, it } from "bun:test";

const BYTES_PER_TOKEN = 3;

function estimateTokens(text: string): number {
  return Math.ceil(Buffer.byteLength(text, "utf8") / BYTES_PER_TOKEN);
}

// Real o200k_base counts, captured from gpt-tokenizer before it was removed.
const SAMPLES: ReadonlyArray<{ name: string; text: string; actual: number }> = [
  {
    name: "english prose",
    text: "The quick brown fox jumps over the lazy dog. ".repeat(120),
    actual: 1201,
  },
  {
    name: "hungarian",
    text: "Árvíztűrő tükörfúrógép és a nagyszerű megoldások keresése közben. ".repeat(80),
    actual: 2082,
  },
  {
    name: "chinese",
    text: "这是一个关于人工智能的测试文本，用于验证分词器的准确性。".repeat(60),
    actual: 1080,
  },
  { name: "emoji heavy", text: "🎉🎊🥳 party time 🚀✨ ".repeat(150), actual: 1651 },
  { name: "minified js", text: "function a(b,c){return b+c}".repeat(120), actual: 1080 },
];

const LOWER_BOUND = 0.5;
const UPPER_BOUND = 2.0;

describe("token estimation", () => {
  it("scales with utf-8 bytes, not characters", () => {
    expect(estimateTokens("中文")).toBeGreaterThan(estimateTokens("ab"));
  });

  it("stays within the documented accuracy band on every sample", () => {
    for (const { name, text, actual } of SAMPLES) {
      const ratio = estimateTokens(text) / actual;
      expect(`${name}:${ratio > LOWER_BOUND}`).toBe(`${name}:true`);
      expect(`${name}:${ratio < UPPER_BOUND}`).toBe(`${name}:true`);
    }
  });

  it("never lets a message an order of magnitude over the limit through", () => {
    const limit = 32_000;
    for (const { name, text, actual } of SAMPLES) {
      const scale = Math.ceil((limit * 10) / actual);
      const huge = text.repeat(scale);
      expect(`${name}:${estimateTokens(huge) > limit}`).toBe(`${name}:true`);
    }
  });
});
