"use client";

import { useChatContext } from "@/lib/contexts/chat-context";
import { useModelStore } from "@/stores/model-store";
import { memo, useMemo } from "react";
import { MessageItem } from "./message-item";

const MemoizedMessageItem = memo(MessageItem);

export default function LastMessage({ conversationId }: { conversationId: string }) {
  const { messages, status } = useChatContext();
  const lastMessageIndex = messages.length - 1;
  const { model } = useModelStore();

  const memoizedLastMessage = useMemo(() => {
    if (
      messages?.length > 0 &&
      messages[lastMessageIndex].role === "assistant" &&
      status !== "ready"
    ) {
      return (
        <MemoizedMessageItem
          message={{ ...messages[lastMessageIndex], model: model.name }}
          conversationId={conversationId}
        />
      );
    }
    return null;
  }, [messages, lastMessageIndex, status]);

  return memoizedLastMessage;
}
