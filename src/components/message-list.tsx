"use client";

import { Loader2 } from "lucide-react";
import { memo, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { ChatLayoutWrapper } from "@/components/chat/chat-layout-wrapper";
import { useChatContext } from "@/components/chat-provider";
import { LoadingDots } from "@/components/loading-dots";
import { MessageItemNew } from "@/components/message-item-new";
import { useConversation, useMessages } from "@/lib/queries/conversations";
import { useModelStore } from "@/stores/model-store";

const MemoizedMessageItem = memo(MessageItemNew);

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

function MessagesContent({
  id,
  persistedMessages,
  streamingMessages,
  error,
  showLoading,
}: Readonly<{
  id: string;
  persistedMessages: import("@/types/chat").CustomUIMessage[];
  streamingMessages: import("@/types/chat").CustomUIMessage[];
  error: Error | null | undefined;
  showLoading: boolean;
}>) {
  // Memoize the persisted messages to prevent re-renders
  const persistedMessagesList = useMemo(
    () =>
      persistedMessages.map((message) => (
        <MemoizedMessageItem
          key={message.id}
          message={message}
          conversationId={id}
          isStreaming={false}
        />
      )),
    [persistedMessages, id]
  );

  return (
    <ConversationContent className="pt-8">
      <ChatLayoutWrapper>
        {/* Old messages - memoized, won't re-render during streaming */}
        {persistedMessagesList}
        {/* New streaming messages - only these re-render */}
        {streamingMessages.map((message) => (
          <MemoizedMessageItem
            key={message.id}
            message={message}
            conversationId={id}
            isStreaming={true}
          />
        ))}
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
      </ChatLayoutWrapper>
    </ConversationContent>
  );
}

export function MessagesList({ id }: Readonly<{ id: string }>) {
  const navigate = useNavigate();
  const { messages: liveMessages, status, error } = useChatContext();
  const setModel = useModelStore((state) => state.setModel);
  const { data: conversation, status: conversationStatus } = useConversation(id);
  const { data: messagesData, isLoading: isMessagesLoading } = useMessages(id);

  // Persisted messages from database (won't change during streaming)
  const persistedMessages = messagesData?.messages || [];

  // Calculate streaming messages (messages that exist in live but not in persisted)
  // Only show streaming messages with meaningful content (>= 2 parts)
  const streamingMessages = useMemo(() => {
    const persistedIds = new Set(persistedMessages.map((m) => m.id));
    return liveMessages.filter(
      (msg) => !persistedIds.has(msg.id) && (msg.parts?.length ?? 0) >= 2
    );
  }, [liveMessages, persistedMessages]);

  const lastPersistedMessage = persistedMessages.at(-1);
  const showLoading =
    (status === "submitted" ||
      (status === "streaming" && streamingMessages.length === 0)) &&
    lastPersistedMessage?.role === "user";

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

  if (isMessagesLoading) {
    return (
      <div className="flex h-[calc(100svh-170px)] flex-1 items-center justify-center md:h-[calc(100svh-198px)]">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Conversation className="relative size-full">
      <MessagesContent
        id={id}
        persistedMessages={persistedMessages}
        streamingMessages={streamingMessages}
        error={error}
        showLoading={showLoading}
      />
      <ConversationScrollButton />
    </Conversation>
  );
}
