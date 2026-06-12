import { isFileUIPart, isTextUIPart } from "ai";
import type { CustomUIMessage } from "@/types/chat";

type UIPart = CustomUIMessage["parts"][number];

export type SanitizeContext = {
  targetProviderId: string | undefined;
  supportsMediaType: (mediaType: string) => boolean;
  providerIdForModel: (modelId: string | undefined) => string | undefined;
};

function keepPart(
  part: UIPart,
  isForeignProvider: boolean,
  ctx: SanitizeContext
): boolean {
  if (isTextUIPart(part)) {
    return part.text.trim().length > 0;
  }
  if (part.type === "step-start") {
    return true;
  }
  if (isFileUIPart(part)) {
    return ctx.supportsMediaType(part.mediaType);
  }
  return !isForeignProvider;
}

export function sanitizeMessagesForModel(
  messages: CustomUIMessage[],
  ctx: SanitizeContext
): CustomUIMessage[] {
  return messages.map((message) => {
    const originProviderId = ctx.providerIdForModel(message.metadata?.model);
    const isForeignProvider = originProviderId !== ctx.targetProviderId;
    const parts = (message.parts ?? []).filter((part) =>
      keepPart(part, isForeignProvider, ctx)
    );
    return { ...message, parts };
  });
}
