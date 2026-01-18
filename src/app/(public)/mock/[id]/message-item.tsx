"use client";

import { useRef } from "react";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import type { CustomUIMessage } from "@/types/chat";

export default function MessageItem({ message }: { message: CustomUIMessage }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  if (renderCount.current > 1) {
    console.log(
      `[MessageItem] 🔄 Re-render #${renderCount.current} - ID: ${message.id.slice(0, 8)} (This should ONLY be streaming messages!)`
    );
  }

  return (
    <Message from={message.role} key={message.id}>
      <MessageContent>
        {message.parts.map((part, i) => {
          switch (part.type) {
            case "text": // we don't use any reasoning or tool calls in this example
              return (
                <MessageResponse key={`${message.id}-${i}`}>{part.text}</MessageResponse>
              );
            default:
              return null;
          }
        })}
      </MessageContent>
    </Message>
  );
}
