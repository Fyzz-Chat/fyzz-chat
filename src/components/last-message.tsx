"use client";

import { useChatStore } from "@/stores/chat-store";
import { useModelStore } from "@/stores/model-store";
import { memo, useMemo } from "react";
import { MessageItem } from "./message-item";

const MemoizedMessageItem = memo(MessageItem);

export default function LastMessage({ conversationId }: { conversationId: string }) {
  const messages = useChatStore((state) => state.messages);
  const status = useChatStore((state) => state.status);
  const lastMessageIndex = messages.length - 1;
  const model = useModelStore((state) => state.model);

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
