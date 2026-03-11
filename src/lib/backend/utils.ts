import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { v4 as uuidv4 } from "uuid";
import { getModelPublic } from "@/lib/backend/providers";
import { logger } from "@/lib/logger";
import type { CustomUIMessage } from "@/types/chat";
import { pdfType, tabularType, videoType } from "@/types/provider";

export function getUnsupportedFileTypes(
  message: CustomUIMessage,
  modelId: string
): string[] {
  const model = getModelPublic(modelId);
  const extensions = model?.extensions ?? [];

  const unsupported = new Set<string>();

  for (const part of message.parts ?? []) {
    if (part.type !== "file" || !part.mediaType) continue;

    const supported = extensions.some((ext) =>
      part.mediaType?.startsWith(ext.includes("/") ? ext : `${ext}/`)
    );

    if (!supported) {
      unsupported.add(part.mediaType);
    }
  }

  return [...unsupported];
}

export function filterMessages(messages: CustomUIMessage[], modelId: string) {
  const model = getModelPublic(modelId);
  const imageSupport = model?.extensions?.some((extension) =>
    extension.startsWith("image/")
  );
  const pdfSupport = model?.extensions?.some((extension) => extension === pdfType);
  const videoSupport = model?.extensions?.some((extension) => extension === videoType);
  const tabularSupport = model?.extensions?.some(
    (extension) => extension === tabularType
  );
  const anthropicModel = model?.id.startsWith("claude") || false;
  const toolsSupport = model?.tools ?? false;

  return messages
    .filter((message) => toolsSupport || (message.role as string) !== "tool")
    .map((message: CustomUIMessage) => ({
      ...message,
      // For Anthropic models only: Remove text-type reasoning parts that lack a signature.
      // All other cases are allowed:
      // - Any part for non-Anthropic models
      // - Reasoning parts WITH signatures (Anthropic)
      // - Reasoning parts WITHOUT signatures (any model but Anthropic)
      parts: message.parts?.filter((part) => {
        if (!toolsSupport && isToolPart(part.type)) {
          return false;
        }

        if (
          anthropicModel &&
          part.type === "reasoning" &&
          part.providerMetadata?.details?.type === "text" &&
          !part.providerMetadata?.details?.signature
        ) {
          return false;
        }

        if (
          !imageSupport &&
          part.type === "file" &&
          part.mediaType?.startsWith("image/")
        ) {
          return false;
        }

        if (!pdfSupport && part.type === "file" && part.mediaType?.startsWith(pdfType)) {
          return false;
        }

        if (
          !videoSupport &&
          part.type === "file" &&
          part.mediaType?.startsWith(videoType)
        ) {
          return false;
        }

        if (
          !tabularSupport &&
          part.type === "file" &&
          part.mediaType?.startsWith(tabularType)
        ) {
          return false;
        }

        return true;
      }),
    }))
    .filter((message) => message.parts.length > 0 || message.role === "user");
}

function isToolPart(partType: string) {
  return partType === "tool-invocation" || partType.startsWith("tool-");
}

export function logDuration(start: number, message: string) {
  const after = performance.now();
  logger.debug(`${message}: ${(after - start).toFixed(2)}ms`);
}

export function isUniqueConstraintViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export function getVersion() {
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), "package.json"), "utf8")
  );
  const app_version = packageJson.version;
  return app_version;
}

export function streamSentence(
  sentence: string,
  opts?: {
    messageId?: string;
    delayInMs?: number;
  }
) {
  const splitSentence = sentence.split(" ");

  const response = createUIMessageStreamResponse({
    status: 200,
    statusText: "OK",
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        const id = opts?.messageId ?? uuidv4();
        const delayInMs = opts?.delayInMs ?? 10;
        writer.write({
          type: "start",
          messageId: opts?.messageId,
        });
        writer.write({
          type: "start-step",
        });
        writer.write({
          id,
          type: "text-start",
        });
        for (const word of splitSentence) {
          await new Promise((resolve) => setTimeout(resolve, delayInMs));
          writer.write({
            id,
            type: "text-delta",
            delta: `${word} `,
          });
        }
        writer.write({
          id,
          type: "text-end",
        });
        writer.write({
          type: "finish-step",
        });
        writer.write({
          type: "finish",
        });
      },
    }),
  });
  return response;
}

export function hasTextPart(message: CustomUIMessage) {
  return message.parts?.some((part) => part.type === "text" && part.text);
}

export function hasInputPart(message: CustomUIMessage) {
  return message.parts?.some((part) => {
    if (part.type === "text") {
      return part.text.trim().length > 0;
    }

    return part.type === "file";
  });
}
