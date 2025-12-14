import { readFileSync } from "fs";
import { join } from "path";
import { getModelPublic } from "@/lib/backend/providers";
import { logger } from "@/lib/logger";
import type { CustomUIMessage } from "@/types/chat";

export function filterMessages(messages: CustomUIMessage[], modelId: string) {
  const model = getModelPublic(modelId);
  const imageSupport = model?.extensions?.some((extension) =>
    extension.startsWith("image/")
  );
  const pdfSupport = model?.extensions?.some(
    (extension) => extension === "application/pdf"
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
      // Filter out tool-call and tool-result parts for all models
      // This ensures clean message history without tool usage metadata
      if (part.type === "tool-call" || part.type === "tool-result") {
        console.log("Filtering out tool part:", part);
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

      if (!imageSupport && part.type === "file" && part.mediaType?.startsWith("image/")) {
        return false;
      }

      if (
        !pdfSupport &&
        part.type === "file" &&
        part.mediaType?.startsWith("application/pdf")
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
