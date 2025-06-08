import { getModelPublic } from "@/lib/backend/providers";
import type { Attachment, Message } from "ai";

export function filterMessages(messages: Message[], modelId: string) {
  const model = getModelPublic(modelId);
  const imageSupport =
    model?.features?.some((feature) => feature.name === "Images") || false;
  const pdfSupport = model?.features?.some((feature) => feature.name === "PDFs") || false;
  const anthropicModel = model?.id.startsWith("claude") || false;

  return messages.map((message: Message) => ({
    ...message,
    experimental_attachments: filterUnsupportedAttachments(
      message.experimental_attachments || [],
      imageSupport,
      pdfSupport
    ),
    // For Anthropic models only: Remove text-type reasoning parts that lack a signature.
    // All other cases are allowed:
    // - Any part for non-Anthropic models
    // - Reasoning parts WITH signatures (Anthropic)
    // - Reasoning parts WITHOUT signatures (any model but Anthropic)
    parts: message.parts?.filter((part) => {
      if (
        anthropicModel &&
        part.type === "reasoning" &&
        part.details[0].type === "text" &&
        !part.details[0].signature
      ) {
        return false;
      }
      return true;
    }),
  }));
}

function filterUnsupportedAttachments(
  attachments: Attachment[],
  imageSupport: boolean,
  pdfSupport: boolean
) {
  return attachments.filter((attachment) => {
    if (imageSupport && attachment.contentType?.startsWith("image/")) return true;
    if (pdfSupport && attachment.contentType?.startsWith("application/pdf")) return true;
    return false;
  });
}
