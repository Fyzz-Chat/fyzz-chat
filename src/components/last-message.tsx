"use client";

import { useMessages } from "@/lib/queries/conversations";
import { useChatStore } from "@/stores/chat-store";
import { useModelStore } from "@/stores/model-store";
import { MessageItem } from "./message-item";

export default function LastMessage({ conversationId }: { conversationId: string }) {
  const lastMessage = useChatStore((state) => state.lastMessage);
  const { data: messages, status: messagesStatus } = useMessages(conversationId);

  if (
    messagesStatus === "success" &&
    messages?.messages[messages.messages.length - 1]?.id === lastMessage?.id
  ) {
    return null;
  }

  if (!lastMessage || lastMessage.parts?.length < 2) {
    return null;
  }

  return <MessageItem message={lastMessage} conversationId={conversationId} />;
}
