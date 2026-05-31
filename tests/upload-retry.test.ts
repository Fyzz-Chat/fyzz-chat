import { afterEach, beforeAll, describe, expect, it, mock } from "bun:test";

let putWithRetry: typeof import("../src/lib/utils").putWithRetry;
const originalFetch = globalThis.fetch;

beforeAll(async () => {
  // utils.ts imports the tRPC client at module load; stub it so the import is
  // side-effect free. putWithRetry itself only uses global fetch.
  mock.module("@/lib/trpc/client", () => ({ standaloneTrpc: {} }));
  ({ putWithRetry } = await import("../src/lib/utils"));
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function reply(status: number): Response {
  return new Response(null, { status });
}

describe("putWithRetry", () => {
  it("succeeds on the first attempt without retrying", async () => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls++;
      return reply(200);
    }) as unknown as typeof fetch;

    await putWithRetry("https://s3/key", "body", "text/plain", 3, 0);
    expect(calls).toBe(1);
  });

  it("retries on a 5xx and then succeeds", async () => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls++;
      return reply(calls === 1 ? 503 : 200);
    }) as unknown as typeof fetch;

    await putWithRetry("https://s3/key", "body", "text/plain", 3, 0);
    expect(calls).toBe(2);
  });

  it("retries on a network error and then succeeds", async () => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls++;
      if (calls === 1) {
        throw new Error("network down");
      }
      return reply(200);
    }) as unknown as typeof fetch;

    await putWithRetry("https://s3/key", "body", "text/plain", 3, 0);
    expect(calls).toBe(2);
  });

  it("does NOT retry on a 4xx (permanent client error)", async () => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls++;
      return reply(403);
    }) as unknown as typeof fetch;

    await expect(
      putWithRetry("https://s3/key", "body", "text/plain", 3, 0)
    ).rejects.toThrow(/403/);
    expect(calls).toBe(1);
  });

  it("gives up after maxAttempts on a persistent 5xx", async () => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls++;
      return reply(500);
    }) as unknown as typeof fetch;

    await expect(
      putWithRetry("https://s3/key", "body", "text/plain", 3, 0)
    ).rejects.toThrow(/500/);
    expect(calls).toBe(3);
  });
});
