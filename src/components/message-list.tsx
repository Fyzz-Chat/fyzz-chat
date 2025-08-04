"use client";

import { useConversation, useMessages } from "@/lib/queries/conversations";
import { useRouter } from "next/navigation";
import { memo, useEffect, useMemo } from "react";
import LastMessage from "./last-message";
import { MessageItem } from "./message-item";
import { LoadingDots } from "./ui/loading-dots";

import { useChatStore } from "@/stores/chat-store";
import { useFileStore } from "@/stores/file-store";
import { useModelStore } from "@/stores/model-store";
import type { UIMessage } from "ai";

const MemoizedMessageItem = memo(MessageItem);

function getErrorMessage(error: { message: string }) {
  if (error.message === "content_filter") {
    return "Uh oh! This message was a little too spicy. Please try again with a different message.";
  } else if (error.message === "file_too_large") {
    return "Uh oh! That was a huge file. Try something smaller than 4MB next time.";
  } else if (error.message === "conversation_locked") {
    return "Woah, slow down! We are still in the middle of saving your previous message.";
  }
  return "Something went wrong.";
}

export function MessagesList({
  initialConversation,
  initialMessages,
  id,
}: {
  initialConversation?: any;
  initialMessages?: { messages: UIMessage[]; hasMore: boolean };
  id: string;
}) {
  const router = useRouter();
  const status = useChatStore((state) => state.status);
  const error = useChatStore((state) => state.error);
  const setModel = useModelStore((state) => state.setModel);
  const files = useFileStore((state) => state.files);
  const { data: conversation, isLoading: isConversationLoading } = useConversation(
    id,
    initialConversation
  );
  const { data: messages } = useMessages(id, initialMessages);
  const showLoading = status === "submitted"; // || (messages?.length === 1 && status !== "streaming");

  useEffect(() => {
    if (!isConversationLoading && !conversation) {
      router.push("/chat");
      return;
    }
    if (conversation?.model) {
      setModel(conversation.model);
    }
  }, [conversation, isConversationLoading]);

  const memoizedConversationMessages = useMemo(() => {
    return messages?.messages?.map((message: any) => (
      <MemoizedMessageItem key={message.id} message={message} conversationId={id} />
    ));
  }, [messages?.messages]);

  return (
    <div className="flex flex-col gap-4 px-4 sm:px-8 pt-8">
      {memoizedConversationMessages}
      {error && (
        <div className="flex flex-col gap-1">
          <div className="text-destructive p-4 border border-destructive rounded-lg">
            <p>{getErrorMessage(error)}</p>
          </div>
          <span className="h-8" />
        </div>
      )}
      <LastMessage conversationId={id} />
      {showLoading && <LoadingDots className="text-muted-foreground" />}
      <div id="messages-end" className="h-4" />
      {files && files.length > 0 && <div className="h-[54px] w-1" />}
    </div>
  );
}
