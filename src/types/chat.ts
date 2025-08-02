import type { Conversation, Message } from "@/lib/prisma/client";
import type { UIMessage } from "ai";

export type PartialConversation = Omit<
  Conversation & { messages: UIMessage[] },
  "userId" | "createdAt" | "updatedAt" | "locked"
>;

export type PartialMessage = Omit<
  Message,
  | "reasoning"
  | "signature"
  | "toolInvocations"
  | "promptTokens"
  | "completionTokens"
  | "conversationId"
  | "updatedAt"
>;

export type ChatLayout = "wide" | "compact";
