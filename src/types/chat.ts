import type { UIMessage } from "ai";
import { z } from "zod";
import type { Conversation, Message } from "@/lib/prisma/generated/client";

export const metadataSchema = z.object({
  model: z.string().optional(),
  content: z.string().optional(),
  createdAt: z.coerce.date(),
  reasoningDurations: z.array(z.object({ id: z.string(), ms: z.number() })).optional(),
});

type CustomMetadata = z.infer<typeof metadataSchema>;

export type CustomUIMessage = UIMessage<CustomMetadata>;

export type PartialConversation = Omit<
  Conversation & { messages: (CustomUIMessage & { content: string })[] },
  "userId" | "createdAt" | "updatedAt" | "locked"
>;

export type PartialMessage = Omit<
  Message,
  "promptTokens" | "completionTokens" | "conversationId" | "updatedAt"
>;

export type ChatLayout = "wide" | "compact";
