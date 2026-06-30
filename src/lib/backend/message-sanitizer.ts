import { isFileUIPart, isTextUIPart, isToolUIPart } from "ai";
import type { CustomUIMessage } from "@/types/chat";

type UIPart = CustomUIMessage["parts"][number];

function carriesEncryptedSearchContent(part: UIPart): boolean {
  if (!isToolUIPart(part) || !("output" in part) || !Array.isArray(part.output)) {
    return false;
  }
  return part.output.some(
    (item) => item != null && typeof item === "object" && "encryptedContent" in item
  );
}

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
  if (carriesEncryptedSearchContent(part)) {
    return false;
  }
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
