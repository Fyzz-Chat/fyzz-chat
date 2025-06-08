"use client";

import { useChatContext } from "@/lib/contexts/chat-context";
import { memo, useMemo } from "react";
import { MessageItem } from "./message-item";

const MemoizedMessageItem = memo(MessageItem);

export default function LastMessage() {
  const { messages, status } = useChatContext();
  const lastMessageIndex = messages.length - 1;

  const memoizedLastMessage = useMemo(() => {
    if (
      messages?.length > 0 &&
      messages[lastMessageIndex].role === "assistant" &&
      status !== "ready"
    ) {
      return <MemoizedMessageItem message={messages[lastMessageIndex]} />;
    }
    return null;
  }, [messages, lastMessageIndex, status]);

  return memoizedLastMessage;
}
