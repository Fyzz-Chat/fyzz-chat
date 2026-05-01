import type { InfiniteData } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { z } from "zod";
import type { Conversation, Message } from "@/lib/prisma/generated/client";

export const metadataSchema = z.object({
  model: z.string().optional(),
  content: z.string().optional(),
  providerResponseId: z.string().optional(),
  createdAt: z.coerce.date(),
  sequence: z.number().optional(),
  reasoningDurations: z.array(z.object({ id: z.string(), ms: z.number() })).optional(),
  status: z.enum(["complete", "pending", "failed"]).optional(),
  externalId: z.string().optional(),
  failedReason: z.string().optional(),
  deepResearch: z.object({ query: z.string() }).optional(),
});

export type CustomMetadata = z.infer<typeof metadataSchema>;

export type ShareInfo = {
  id: string;
  messageId: string;
  expiresAt: Date | null;
};

export type CustomUIMessage = UIMessage<CustomMetadata>;

export type PartialConversation = Omit<
  Conversation & { messages: CustomUIMessage[] },
  "userId" | "createdAt" | "updatedAt" | "locked"
>;

export type PartialMessage = Omit<
  Message,
  "promptTokens" | "completionTokens" | "conversationId" | "updatedAt"
>;

export type ChatLayout = "wide" | "compact";

// Type definitions for query data
export type ConversationPage = {
  items: PartialConversation[];
  nextCursor: string | undefined;
};

export type ConversationsInfiniteData = InfiniteData<ConversationPage, string | null>;

export type MessagesData = {
  messages: CustomUIMessage[];
  hasMore: boolean;
};

export interface ProjectWithCount {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  conversationCount: number;
  lastActivityAt: Date;
}
