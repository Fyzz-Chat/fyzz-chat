import "server-only";

import { encode } from "gpt-tokenizer";
import conf from "@/lib/config";
import type { CustomUIMessage } from "@/types/chat";

export function countTextTokens(text: string): number {
  return encode(text).length;
}

export function countMessageTokens(message: CustomUIMessage): number {
  let total = 0;
  for (const part of message.parts) {
    if (part.type === "text") {
      total += encode(part.text).length;
    }
  }
  return total;
}

function formatTokenLimitMessage(tokens: number, limit: number): string {
  return `Your message is too long (${tokens.toLocaleString()} tokens, limit ${limit.toLocaleString()}). Please shorten it or split it into smaller messages.`;
}

function buildLimitResponse(tokens: number, limit: number): Response {
  return new Response(formatTokenLimitMessage(tokens, limit), { status: 413 });
}

export function enforceTokenLimitForMessage(message: CustomUIMessage): Response | null {
  const limit = conf.perMessageTokenLimit;
  if (limit === undefined) return null;
  const tokens = countMessageTokens(message);
  if (tokens <= limit) return null;
  return buildLimitResponse(tokens, limit);
}

export function enforceTokenLimitForText(text: string): Response | null {
  const limit = conf.perMessageTokenLimit;
  if (limit === undefined) return null;
  const tokens = countTextTokens(text);
  if (tokens <= limit) return null;
  return buildLimitResponse(tokens, limit);
}
