import type { Message } from "@/lib/prisma/client";
import type { UIMessage } from "ai";

interface ProcessedMessage {
  content?: string;
  parts: Array<{
    type: "text" | "reasoning";
    text?: string;
    reasoning?: string;
    details?: Array<{
      type: "text";
      text: string;
      signature: string;
    }>;
  }>;
}

function processMessage(message: UIMessage): ProcessedMessage {
  const parts: ProcessedMessage["parts"] = [];

  if (message.parts) {
    return {
      ...message,
      parts: message.parts as ProcessedMessage["parts"],
    };
  }

  if (message.content) {
    parts.push({
      type: "text",
      text: message.content,
    });
  }

  return {
    ...message,
    parts,
  };
}

export function processMessages(messages: UIMessage[]): ProcessedMessage[] {
  return messages.map(processMessage);
}
