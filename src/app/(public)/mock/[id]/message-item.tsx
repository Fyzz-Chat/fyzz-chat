"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useRef, useState } from "react";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
  MessageToolbar,
} from "@/components/ai-elements/message";
import type { CustomUIMessage } from "@/types/chat";

export default function MessageItem({
  message,
  conversationId,
}: {
  message: CustomUIMessage;
  conversationId: string;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const renderCount = useRef(0);
  renderCount.current += 1;

  if (renderCount.current > 1) {
    console.log(
      `[MessageItem] 🔄 Re-render #${renderCount.current} - ID: ${message.id.slice(0, 8)} (This should ONLY be streaming messages!)`
    );
  }

  function handleCopy() {
    setIsCopied(true);
    navigator.clipboard.writeText(message.metadata?.content || "");
    setTimeout(() => setIsCopied(false), 1500);
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
      {message.role === "assistant" && (
        <MessageToolbar>
          <MessageActions>
            <MessageAction label="Copy" tooltip="Copy message" onClick={handleCopy}>
              {isCopied ? (
                <CheckIcon className="size-4" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </MessageAction>
          </MessageActions>
        </MessageToolbar>
      )}
      {message.role === "user" && (
        <MessageToolbar className="flex-row-reverse">
          <MessageActions>
            <MessageAction label="Copy" tooltip="Copy message" onClick={handleCopy}>
              {isCopied ? (
                <CheckIcon className="size-4" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </MessageAction>
          </MessageActions>
        </MessageToolbar>
      )}
    </Message>
  );
}
