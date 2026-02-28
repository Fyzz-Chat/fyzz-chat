import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getFileUrlSigned } from "@/lib/aws/s3";
import { getModelPublic } from "@/lib/backend/providers";
import { logger } from "@/lib/logger";
import type { CustomUIMessage } from "@/types/chat";
import { pdfType, tabularType, videoType } from "@/types/provider";

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

  return messages.map((message: CustomUIMessage) => ({
    ...message,
    // For Anthropic models only: Remove text-type reasoning parts that lack a signature.
    // All other cases are allowed:
    // - Any part for non-Anthropic models
    // - Reasoning parts WITH signatures (Anthropic)
    // - Reasoning parts WITHOUT signatures (any model but Anthropic)
    parts: message.parts?.filter((part) => {
      if (
        anthropicModel &&
        part.type === "reasoning" &&
        part.providerMetadata?.details?.type === "text" &&
        !part.providerMetadata?.details?.signature
      ) {
        return false;
      }

      if (!imageSupport && part.type === "file" && part.mediaType?.startsWith("image/")) {
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
  }));
}

export function logDuration(start: number, message: string) {
  const after = performance.now();
  logger.debug(`${message}: ${(after - start).toFixed(2)}ms`);
}

export function getVersion() {
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), "package.json"), "utf8")
  );
  const app_version = packageJson.version;
  return app_version;
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

export function mapFileParts(
  message: CustomUIMessage,
  userId: string,
  conversationId: string
): CustomUIMessage {
  return {
    ...message,
    parts: message.parts?.map((part: CustomUIMessage["parts"][number]) => {
      if (part.type === "file") {
        return {
          ...part,
          url: getFileUrlSigned(`${userId}/${conversationId}`, part.url),
        };
      }
      return part;
    }),
  };
}
