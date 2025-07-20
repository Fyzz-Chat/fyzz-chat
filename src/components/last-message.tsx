"use client";

import { useChatStore } from "@/stores/chat-store";
import { useModelStore } from "@/stores/model-store";
import { memo, useMemo } from "react";
import { MessageItem } from "./message-item";

const MemoizedMessageItem = memo(MessageItem);

export default function LastMessage({ conversationId }: { conversationId: string }) {
  const lastMessage = useChatStore((state) => state.lastMessage);
  const status = useChatStore((state) => state.status);
  const model = useModelStore((state) => state.model);

  const memoizedLastMessage = useMemo(() => {
    if (lastMessage && status !== "ready") {
      return (
        <MemoizedMessageItem
          message={{ ...lastMessage, model: model.name }}
          conversationId={conversationId}
        />
      );
    }
    return null;
  }, [lastMessage, status]);

  return memoizedLastMessage;
}
