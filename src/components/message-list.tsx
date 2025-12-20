"use client";

import { Loader2 } from "lucide-react";
import { memo, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import LastMessage from "@/components/last-message";
import { LoadingDots } from "@/components/loading-dots";
import { MessageItem } from "@/components/message-item";
import { useConversation, useMessages } from "@/lib/queries/conversations";
import { useChatStore } from "@/stores/chat-store";
import { useFileStore } from "@/stores/file-store";
import { useModelStore } from "@/stores/model-store";

const MemoizedMessageItem = memo(MessageItem);

function getErrorMessage(error: { message: string }) {
  if (error.message === "content_filter") {
    return "Uh oh! This message was a little too spicy. Please try again with a different message.";
  } else if (error.message === "file_too_large") {
    return "Uh oh! That was a huge file. Try something smaller than 4MB next time.";
  } else if (error.message === "conversation_locked") {
    return "Woah, slow down! We are still in the middle of saving your previous message.";
  } else if (error.message === "mcp_clients_init_error") {
    return "One or more MCP servers failed to initialize. Please try again.";
  }
  return "Something went wrong.";
}

export function MessagesList({ id }: Readonly<{ id: string }>) {
  const navigate = useNavigate();
  const status = useChatStore((state) => state.status);
  const error = useChatStore((state) => state.error);
  const setModel = useModelStore((state) => state.setModel);
  const files = useFileStore((state) => state.files);
  const { data: conversation, status: conversationStatus } = useConversation(id);
  const { data: messages, isLoading: isMessagesLoading } = useMessages(id);
  const newMessage = useChatStore((state) => state.lastMessage);
  const lastMessage = messages?.messages.at(-1);
  const showLoading =
    (status === "submitted" ||
      (status === "streaming" && (newMessage?.parts?.length ?? 0) < 2)) &&
    lastMessage?.role === "user";

  useEffect(() => {
    if (conversationStatus === "error") {
      navigate("/chat");
      return;
    }
    if (conversationStatus !== "success") return;
    if (!conversation) {
      navigate("/chat");
      return;
    }
    if (conversation.model) {
      setModel(conversation.model);
    }
  }, [conversationStatus, conversation, navigate, setModel]);

  const memoizedConversationMessages = useMemo(() => {
    return messages?.messages?.map((message) => (
      <MemoizedMessageItem key={message.id} message={message} conversationId={id} />
    ));
  }, [messages?.messages, id]);

  if (isMessagesLoading) {
    return (
      <div className="flex h-[calc(100svh-170px)] flex-1 items-center justify-center md:h-[calc(100svh-198px)]">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-8 sm:px-8">
      {memoizedConversationMessages}
      <LastMessage conversationId={id} />
      {error && (
        <div className="flex flex-col gap-1">
          <div className="rounded-lg border border-destructive p-4 text-destructive">
            <p>{getErrorMessage(error)}</p>
          </div>
          <span className="h-8" />
        </div>
      )}
      {showLoading && <LoadingDots className="text-muted-foreground" />}
      <div id="messages-end" className="h-4" />
      {files && files.length > 0 && <div className="h-13.5 w-1" />}
    </div>
  );
}
