import "server-only";

import type { LanguageModelV3Message } from "@ai-sdk/provider";
import type { LanguageModelMiddleware } from "ai";
import { getModelPublic } from "@/lib/backend/providers";

type AnyContentPart = Extract<
  LanguageModelV3Message,
  { role: "assistant" }
>["content"][number];

export function messageFilterMiddleware(modelId: string): LanguageModelMiddleware {
  const model = getModelPublic(modelId);
  const extensions = model?.extensions ?? [];
  const toolsSupport = model?.tools ?? false;
  const isAnthropic = model?.id.startsWith("claude") ?? false;

  function isSupported(mediaType: string): boolean {
    return extensions.some((ext) =>
      mediaType.startsWith(ext.includes("/") ? ext : `${ext}/`)
    );
  }

  function shouldKeepPart(part: AnyContentPart): boolean {
    if (!toolsSupport && (part.type === "tool-call" || part.type === "tool-result")) {
      return false;
    }
    if (
      isAnthropic &&
      part.type === "reasoning" &&
      !part.providerOptions?.anthropic?.signature
    ) {
      return false;
    }
    if (part.type === "file" && !isSupported(part.mediaType)) {
      return false;
    }
    return true;
  }

  return {
    specificationVersion: "v3",
    transformParams: async ({ params }) => {
      const prompt = params.prompt.flatMap((message): LanguageModelV3Message[] => {
        if (!toolsSupport && message.role === "tool") return [];
        if (message.role === "system") return [message];

        const content = (message.content as AnyContentPart[]).filter(shouldKeepPart);

        if (content.length === 0 && message.role !== "user") return [];
        return [{ ...message, content } as LanguageModelV3Message];
      });

      return { ...params, prompt };
    },
  };
}
