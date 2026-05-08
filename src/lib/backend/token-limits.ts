import "server-only";

import { createHash } from "node:crypto";
import { encode } from "gpt-tokenizer";
import { extractText, getDocumentProxy } from "unpdf";
import { getObjectBytes, headObjectSize } from "@/lib/aws/s3";
import conf from "@/lib/config";
import {
  cacheFileTokens,
  getCachedFileTokens,
  getCachedFileTokensBatch,
} from "@/lib/dao/file-tokens";
import { logger } from "@/lib/logger";
import type { CustomUIMessage } from "@/types/chat";

const MAX_ATTACHMENT_FETCH_BYTES = 10 * 1024 * 1024; // 10 MB

const PER_PDF_PAGE_VISION_TOKENS = 1500;

const TEXT_LIKE_MEDIA_TYPES = new Set([
  "application/json",
  "application/xml",
  "application/csv",
  "application/x-yaml",
  "application/yaml",
]);

function isTextLikeMediaType(mediaType: string): boolean {
  if (mediaType.startsWith("text/")) return true;
  return TEXT_LIKE_MEDIA_TYPES.has(mediaType);
}

type FilePart = { url: string; mediaType: string; filename?: string };

function fileCacheKey(filePart: FilePart): string {
  if (filePart.url.startsWith("data:")) {
    return `sha256:${createHash("sha256").update(filePart.url).digest("hex")}`;
  }
  return `s3:${filePart.url}`;
}

function countTextTokens(text: string): number {
  return encode(text).length;
}

function countMessageTextTokens(message: CustomUIMessage): number {
  let total = 0;
  for (const part of message.parts) {
    if (part.type === "text") {
      total += encode(part.text).length;
    }
  }
  return total;
}

function decodeDataUrl(url: string): Uint8Array | null {
  const commaIndex = url.indexOf(",");
  if (commaIndex < 0) return null;
  const header = url.slice(0, commaIndex);
  const body = url.slice(commaIndex + 1);
  if (!header.includes(";base64")) {
    return new TextEncoder().encode(decodeURIComponent(body));
  }
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function fetchAttachmentBytes(
  filePart: FilePart,
  s3KeyPrefix: string
): Promise<Uint8Array> {
  if (filePart.url.startsWith("data:")) {
    const bytes = decodeDataUrl(filePart.url);
    if (!bytes) throw new Error("Malformed data URL");
    if (bytes.byteLength > MAX_ATTACHMENT_FETCH_BYTES) {
      throw new Error(
        `Attachment exceeds ${MAX_ATTACHMENT_FETCH_BYTES} byte fetch ceiling`
      );
    }
    return bytes;
  }

  const fullKey = `${s3KeyPrefix}/${filePart.url}`;
  const size = await headObjectSize(fullKey);
  if (size === null) {
    throw new Error("S3 not configured or object missing");
  }
  if (size > MAX_ATTACHMENT_FETCH_BYTES) {
    throw new Error(
      `Attachment ${size} bytes exceeds ${MAX_ATTACHMENT_FETCH_BYTES} fetch ceiling`
    );
  }
  const bytes = await getObjectBytes(fullKey);
  if (!bytes) throw new Error("Failed to download attachment");
  return bytes;
}

async function tokenizeBytesByMediaType(
  bytes: Uint8Array,
  mediaType: string
): Promise<number> {
  if (isTextLikeMediaType(mediaType)) {
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    return encode(text).length;
  }

  if (mediaType === "application/pdf") {
    const pdf = await getDocumentProxy(bytes);
    const result = await extractText(pdf, { mergePages: true });
    const merged = Array.isArray(result.text) ? result.text.join("\n") : result.text;
    const extractedTokens = encode(merged).length;
    const pageBased = (result.totalPages ?? 0) * PER_PDF_PAGE_VISION_TOKENS;
    return Math.max(extractedTokens, pageBased);
  }

  // Images and other binary: deferred to a later phase. Returning 0 here means
  // we do not gate on them yet — image tokenization needs per-provider math.
  return 0;
}

async function liveCountAttachmentTokens(
  filePart: FilePart,
  s3KeyPrefix: string
): Promise<number> {
  const bytes = await fetchAttachmentBytes(filePart, s3KeyPrefix);
  return tokenizeBytesByMediaType(bytes, filePart.mediaType);
}

async function countAttachmentTokens(
  filePart: FilePart,
  s3KeyPrefix: string
): Promise<number> {
  const cacheKey = fileCacheKey(filePart);

  try {
    const cached = await getCachedFileTokens(cacheKey);
    if (cached !== null) return cached;
  } catch (error) {
    logger.warn({
      message: "[Chat] FileTokenCache lookup failed; falling back to live extract.",
      cacheKey,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const tokens = await liveCountAttachmentTokens(filePart, s3KeyPrefix);

  try {
    await cacheFileTokens(cacheKey, tokens, filePart.mediaType);
  } catch (error) {
    logger.warn({
      message: "[Chat] FileTokenCache write failed; not fatal.",
      cacheKey,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return tokens;
}

function getFileParts(message: CustomUIMessage): FilePart[] {
  return message.parts.filter(
    (p): p is Extract<CustomUIMessage["parts"][number], { type: "file" }> =>
      p.type === "file"
  );
}

async function countMessageAttachmentTokens(
  message: CustomUIMessage,
  s3KeyPrefix: string
): Promise<number> {
  const fileParts = getFileParts(message);
  if (fileParts.length === 0) return 0;
  const counts = await Promise.all(
    fileParts.map((part) => countAttachmentTokens(part, s3KeyPrefix))
  );
  return counts.reduce((sum, n) => sum + n, 0);
}

function formatTokenLimitMessage(tokens: number, limit: number): string {
  return `Your message is too long (${tokens.toLocaleString()} tokens, limit ${limit.toLocaleString()}). Please shorten it or split it into smaller messages.`;
}

function buildLimitResponse(tokens: number, limit: number): Response {
  return new Response(formatTokenLimitMessage(tokens, limit), { status: 413 });
}

function buildAttachmentValidationError(): Response {
  return new Response(
    "Could not validate attachment size. Please remove or replace the attachment and try again.",
    { status: 413 }
  );
}

function buildHistoryRejection(limit: number): Response {
  return new Response(
    `This conversation contains a message that exceeds the current ${limit.toLocaleString()}-token limit. Please start a new chat.`,
    { status: 413 }
  );
}

export async function enforceTokenLimitForMessage(
  message: CustomUIMessage,
  s3KeyPrefix: string
): Promise<Response | null> {
  const limit = conf.perMessageTokenLimit;
  if (limit === undefined) return null;

  const textTokens = countMessageTextTokens(message);
  if (textTokens > limit) return buildLimitResponse(textTokens, limit);

  let attachmentTokens: number;
  try {
    attachmentTokens = await countMessageAttachmentTokens(message, s3KeyPrefix);
  } catch (error) {
    logger.warn({
      message: "[Chat] Attachment token validation failed; rejecting message.",
      error: error instanceof Error ? error.message : String(error),
    });
    return buildAttachmentValidationError();
  }

  const total = textTokens + attachmentTokens;
  if (total > limit) return buildLimitResponse(total, limit);
  return null;
}

export function enforceTokenLimitForText(text: string): Response | null {
  const limit = conf.perMessageTokenLimit;
  if (limit === undefined) return null;
  const tokens = countTextTokens(text);
  if (tokens <= limit) return null;
  return buildLimitResponse(tokens, limit);
}

export async function enforceHistoryWithinLimit(
  messages: CustomUIMessage[],
  s3KeyPrefix: string
): Promise<Response | null> {
  const limit = conf.perMessageTokenLimit;
  if (limit === undefined) return null;
  if (messages.length === 0) return null;

  const allFileParts = messages.flatMap(getFileParts);
  if (allFileParts.length > 0) {
    try {
      await getCachedFileTokensBatch(allFileParts.map(fileCacheKey));
    } catch (error) {
      logger.warn({
        message: "[Chat] History cache prewarm failed; continuing per-row.",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const perMessageTotals = await Promise.all(
    messages.map(async (message) => {
      const textTokens = countMessageTextTokens(message);
      try {
        const attachmentTokens = await countMessageAttachmentTokens(message, s3KeyPrefix);
        return textTokens + attachmentTokens;
      } catch (error) {
        logger.warn({
          message: "[Chat] Historical attachment token validation failed.",
          error: error instanceof Error ? error.message : String(error),
        });
        // Fail closed: any uncountable attachment in history blocks the chat.
        return Number.POSITIVE_INFINITY;
      }
    })
  );

  for (const total of perMessageTotals) {
    if (total > limit) return buildHistoryRejection(limit);
  }
  return null;
}
