import type { FileUIPart, TextUIPart } from "ai";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { standaloneTrpc } from "@/lib/trpc/client";
import type { CustomUIMessage } from "@/types/chat";

export const INPUT_STORAGE_KEY = "fyzz-input-content";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FormState = {
  message: string;
  description: string;
  success?: boolean;
};

export const initialState: FormState = {
  message: "",
  description: "",
  success: undefined,
};

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatTimeAgo(date: Date): string {
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return rtf.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) return rtf.format(days, "day");
  const weeks = Math.round(days / 7);
  if (Math.abs(weeks) < 5) return rtf.format(weeks, "week");
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return rtf.format(months, "month");
  return rtf.format(Math.round(days / 365), "year");
}

export function addDurationToDate(date: Date, duration: string): Date | null {
  const result = new Date(date);
  if (duration === "1D") {
    result.setDate(result.getDate() + 1);
  } else if (duration === "1W") {
    result.setDate(result.getDate() + 7);
  } else if (duration === "1M") {
    result.setMonth(result.getMonth() + 1);
  } else {
    return null;
  }
  return result;
}

/**
 * @lintignore
 */
export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// biome-ignore lint/complexity/noBannedTypes: TODO: Need further investigation
export function debounce(func: Function, wait = 100) {
  let timeout: NodeJS.Timeout;
  function executedFunction(...args: unknown[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }
  executedFunction.cancel = () => clearTimeout(timeout);
  return executedFunction;
}

/**
 * @lintignore
 */
export function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function filterMessagesUpToAnchor(
  old: CustomUIMessage[],
  messageId: string,
  newContent?: string
): CustomUIMessage[] {
  const anchorMessage = old.find((m: CustomUIMessage) => m.id === messageId);

  if (!anchorMessage) {
    return old;
  }
  const anchorMessageDate = new Date(anchorMessage.metadata?.createdAt as Date);
  const isUserMessage = anchorMessage.role === "user";

  // Keep messages older than the anchor message and the anchor itself if it's a user message
  return old
    .filter((m: CustomUIMessage) => {
      const messageDate = new Date(m.metadata?.createdAt as Date);
      const isBefore = messageDate < anchorMessageDate;
      const isAnchorAndUserMessage = isUserMessage && m.id === messageId;
      return isBefore || isAnchorAndUserMessage;
    })
    .map((m: CustomUIMessage) => {
      if (m.id === messageId) {
        return {
          ...m,
          content: newContent ?? m.metadata?.content,
          parts: newContent
            ? [
                {
                  type: "text",
                  text: newContent,
                },
              ]
            : m.parts,
        };
      }
      return m;
    });
}

async function getFileId(fileUIPart: FileUIPart): Promise<string> {
  const msgBuffer = new TextEncoder().encode(fileUIPart.url);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return hashHex;
}

// PUTs to S3 with bounded retry on transient failures (network error or 5xx).
// A 4xx is a permanent client error (e.g. an expired presigned URL) and is not
// retried. Throws the last error once attempts are exhausted.
export async function putWithRetry(
  url: string,
  body: BodyInit,
  contentType: string,
  maxAttempts = 3,
  baseDelayMs = 200,
  perAttemptTimeoutMs = 30_000
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let permanent = false;
    try {
      const response = await fetch(url, {
        method: "PUT",
        body,
        headers: { "Content-Type": contentType },
        signal: AbortSignal.timeout(perAttemptTimeoutMs),
      });
      if (response.ok) {
        return;
      }
      lastError = new Error(`upload failed (status ${response.status})`);
      permanent = response.status < 500; // 4xx won't self-heal — don't retry
    } catch (error) {
      lastError = error; // network error — retryable
    }

    if (permanent) {
      break;
    }
    if (attempt < maxAttempts) {
      await new Promise((resolve) =>
        setTimeout(resolve, baseDelayMs * 2 ** (attempt - 1))
      );
    }
  }

  throw lastError instanceof Error ? lastError : new Error("upload failed");
}

export async function uploadFileParts(
  conversationId: string,
  fileUIParts: FileUIPart[]
): Promise<FileUIPart[]> {
  const uploadUrls = await standaloneTrpc.getUploadUrls.query(
    {
      conversationId,
      count: fileUIParts.length,
      fileIds: await Promise.all(fileUIParts.map((fileUIPart) => getFileId(fileUIPart))),
    },
    { signal: AbortSignal.timeout(15_000) }
  );

  const results = await Promise.allSettled(
    fileUIParts.map(async (fileUIPart, index) => {
      const { key, url } = uploadUrls[index];
      if (!url) {
        // S3 not configured (e.g. OSS self-host) — keep the file as-is.
        return fileUIPart;
      }

      const file = await fileUIPartToFile(fileUIPart);
      await putWithRetry(url, file, fileUIPart.mediaType, 3, 200, 30_000);

      return {
        ...fileUIPart,
        url: key,
      };
    })
  );

  const failed = results.flatMap((result, index) =>
    result.status === "rejected" ? [fileUIParts[index].filename || "file"] : []
  );

  if (failed.length > 0) {
    // Don't return a partial set — fail the whole batch so nothing is silently
    // dropped. The caller aborts the send and keeps the input for retry.
    throw new Error(
      `Failed to upload ${failed.length} of ${fileUIParts.length} file(s): ${failed.join(", ")}`
    );
  }

  return results.map((result) => (result as PromiseFulfilledResult<FileUIPart>).value);
}

async function fileUIPartToFile(fileUIPart: FileUIPart): Promise<File> {
  const response = await fetch(fileUIPart.url);
  if (!response.ok) {
    throw new Error("Failed to fetch file for upload");
  }
  const blob = await response.blob();
  const file = new File([blob], fileUIPart.filename || "file", {
    type: fileUIPart.mediaType,
  });

  return file;
}

export function getMessageContent(message: CustomUIMessage): string {
  if (message?.metadata?.content) {
    return message.metadata.content;
  }

  return (
    message.parts
      ?.filter((part): part is TextUIPart => part.type === "text")
      .map((part) => part.text)
      .join("\n") || ""
  );
}
