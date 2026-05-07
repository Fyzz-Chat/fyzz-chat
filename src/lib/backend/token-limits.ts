import "server-only";

import { encode } from "gpt-tokenizer";
import { extractText, getDocumentProxy } from "unpdf";
import { getObjectBytes, headObjectSize } from "@/lib/aws/s3";
import conf from "@/lib/config";
import { logger } from "@/lib/logger";
import type { CustomUIMessage } from "@/types/chat";

// Hard ceiling on how many bytes we will fetch+extract per attachment.
// Anything larger is rejected without download — both as a cost guard and to
// prevent OOM during PDF extraction. This is independent of the user-facing
// token limit; it is the safety net.
const MAX_ATTACHMENT_FETCH_BYTES = 10 * 1024 * 1024; // 10 MB

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

export function countTextTokens(text: string): number {
  return encode(text).length;
}

export function countMessageTextTokens(message: CustomUIMessage): number {
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
    // Plain text data URL; encode as UTF-8 bytes for downstream tokenization.
    return new TextEncoder().encode(decodeURIComponent(body));
  }
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function fetchAttachmentBytes(
  filePart: { url: string },
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

// Conservative per-page bound for PDFs whose text we cannot extract — covers the
// vision-token cost a model pays when ingesting a page as an image.
const PER_PDF_PAGE_VISION_TOKENS = 1500;

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
    // Use the larger of the two: text-PDFs report real text tokens, scanned or
    // unparseable PDFs are bounded by page count × vision cost.
    return Math.max(extractedTokens, pageBased);
  }

  // Images and other binary: deferred to a later phase. Returning 0 here means
  // we do not gate on them yet — image tokenization needs per-provider math.
  return 0;
}

async function countAttachmentTokens(
  filePart: { url: string; mediaType: string },
  s3KeyPrefix: string
): Promise<number> {
  const bytes = await fetchAttachmentBytes(filePart, s3KeyPrefix);
  return tokenizeBytesByMediaType(bytes, filePart.mediaType);
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

export async function enforceTokenLimitForMessage(
  message: CustomUIMessage,
  s3KeyPrefix: string
): Promise<Response | null> {
  const limit = conf.perMessageTokenLimit;
  if (limit === undefined) return null;

  let total = countMessageTextTokens(message);
  if (total > limit) return buildLimitResponse(total, limit);

  const fileParts = message.parts.filter(
    (p): p is Extract<CustomUIMessage["parts"][number], { type: "file" }> =>
      p.type === "file"
  );

  for (const part of fileParts) {
    let attachmentTokens: number;
    try {
      attachmentTokens = await countAttachmentTokens(part, s3KeyPrefix);
    } catch (error) {
      logger.warn({
        message: "[Chat] Attachment token validation failed; rejecting message.",
        filename: part.filename,
        mediaType: part.mediaType,
        error: error instanceof Error ? error.message : String(error),
      });
      return buildAttachmentValidationError();
    }
    total += attachmentTokens;
    if (total > limit) return buildLimitResponse(total, limit);
  }

  return null;
}

export function enforceTokenLimitForText(text: string): Response | null {
  const limit = conf.perMessageTokenLimit;
  if (limit === undefined) return null;
  const tokens = countTextTokens(text);
  if (tokens <= limit) return null;
  return buildLimitResponse(tokens, limit);
}
