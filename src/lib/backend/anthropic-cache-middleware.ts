import "server-only";

import type { LanguageModelMiddleware } from "ai";

const CACHE_CONTROL = { type: "ephemeral" as const };
const ANTHROPIC_CACHE = { anthropic: { cacheControl: CACHE_CONTROL } };

function hasFileParts(message: { role: string; content: unknown }): boolean {
  if (message.role !== "user") return false;
  if (!Array.isArray(message.content)) return false;
  return message.content.some((part: { type: string }) => part.type === "file");
}

export const anthropicCacheMiddleware: LanguageModelMiddleware = {
  specificationVersion: "v3",
  transformParams: async ({ params }) => {
    const prompt = params.prompt.map((message) => {
      if (message.role === "system") {
        return {
          ...message,
          providerOptions: { ...message.providerOptions, ...ANTHROPIC_CACHE },
        };
      }
      return message;
    });

    for (let i = prompt.length - 1; i >= 0; i--) {
      if (hasFileParts(prompt[i])) {
        prompt[i] = {
          ...prompt[i],
          providerOptions: { ...prompt[i].providerOptions, ...ANTHROPIC_CACHE },
        };
        break;
      }
    }

    for (let i = prompt.length - 1; i >= 0; i--) {
      if (
        prompt[i].role === "user" &&
        !prompt[i].providerOptions?.anthropic?.cacheControl
      ) {
        prompt[i] = {
          ...prompt[i],
          providerOptions: { ...prompt[i].providerOptions, ...ANTHROPIC_CACHE },
        };
        break;
      }
    }

    return { ...params, prompt };
  },
};
