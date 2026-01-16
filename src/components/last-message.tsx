"use client";

import { MessageItemNew } from "@/components/message-item-new";
import { useMessages } from "@/lib/queries/conversations";
import { useChatStore } from "@/stores/chat-store";

export default function LastMessage({
  conversationId,
}: Readonly<{ conversationId: string }>) {
  const lastMessage = useChatStore((state) => state.lastMessage);
  const { data: messages, status: messagesStatus } = useMessages(conversationId);

  if (messagesStatus === "success" && messages?.messages.at(-1)?.id === lastMessage?.id) {
    return null;
  }

  if (!lastMessage || lastMessage.parts?.length < 2) {
    return null;
  }

  return <MessageItemNew message={lastMessage} conversationId={conversationId} />;
}
