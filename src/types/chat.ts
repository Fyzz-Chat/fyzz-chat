import type { Conversation } from "@/lib/prisma/client";
import type { UIMessage } from "ai";

export type PartialConversation = Omit<
  Conversation & { messages: UIMessage[] },
  "userId" | "createdAt" | "updatedAt" | "locked"
>;

export type ChatLayout = "wide" | "compact";
