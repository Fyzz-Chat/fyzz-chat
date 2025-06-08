import type { Message } from "@/lib/prisma/client";

interface RawMessage extends Omit<Message, "reasoning"> {
  reasoning: string | undefined;
}

interface ProcessedMessage {
  content?: string;
  reasoning: string | undefined;
  signature: string | null;
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

function processMessage(message: RawMessage): ProcessedMessage {
  const parts: ProcessedMessage["parts"] = [];

  if (message.parts) {
    return {
      ...message,
      parts: message.parts as ProcessedMessage["parts"],
    };
  }

  if (message.reasoning) {
    const details: ProcessedMessage["parts"][0]["details"] = [];
    if (message.signature) {
      details.push({
        type: "text",
        text: message.reasoning,
        signature: message.signature,
      });
    }

    parts.push({
      type: "reasoning",
      reasoning: message.reasoning,
      details,
    });
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

export function processMessages(messages: RawMessage[]): ProcessedMessage[] {
  return messages.map(processMessage);
}
