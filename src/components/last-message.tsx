"use client";

import { useMessages } from "@/lib/queries/conversations";
import { useChatStore } from "@/stores/chat-store";
import { useModelStore } from "@/stores/model-store";
import { memo, useMemo } from "react";
import { MessageItem } from "./message-item";

const MemoizedMessageItem = memo(MessageItem);

export default function LastMessage({ conversationId }: { conversationId: string }) {
  const lastMessage = useChatStore((state) => state.lastMessage);
  const model = useModelStore((state) => state.model);
  const { data: messages, status } = useMessages(conversationId);

  const memoizedLastMessage = useMemo(() => {
    if (lastMessage) {
      return (
        <MemoizedMessageItem
          message={{ ...lastMessage, model: model.name }}
          conversationId={conversationId}
        />
      );
    }
    return null;
  }, [lastMessage]);

  if (
    status === "success" &&
    messages?.messages[messages.messages.length - 1]?.id === lastMessage?.id
  ) {
    return null;
  }

  return memoizedLastMessage;
}
