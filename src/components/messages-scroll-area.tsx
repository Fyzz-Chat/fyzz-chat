"use client";

import { ChatLayoutWrapper } from "@/components/chat/chat-layout-wrapper";
import { KeyHandler } from "@/components/key-handler";
import { ScrollToBottomButton } from "@/components/scroll-to-bottom-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessages } from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

export default function MessagesScrollArea({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const params = useParams();
  const conversationId = params.id as string;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Listen to the actual message data that's being rendered
  const { data: messages } = useMessages(conversationId);
  // Also listen to streaming message for real-time updates
  const lastMessage = useChatStore((state) => state.lastMessage);
  const error = useChatStore((state) => state.error);
  const [positionChecked, setPositionChecked] = useState(false);

  const scrollToBottom = () => {
    const viewport = viewportRef.current;
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: "instant",
      });
    }
  };

  // Scroll to bottom when the component mounts
  useEffect(() => {
    scrollToBottom();
  }, []);

  // Scroll to bottom when messages change (TanStack Query data) OR when streaming message updates
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages?.messages, lastMessage, autoScroll, error]);

  const isUserAtBottom = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return false;
    const isAtBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 10;

    if (!positionChecked) setPositionChecked(true);
    return isAtBottom;
  }, [positionChecked]);

  const handleScroll = () => {
    setAutoScroll(isUserAtBottom());
  };

  return (
    <>
      <KeyHandler keyString=" " handler={scrollToBottom} />
      <ScrollArea
        className={cn("", className)}
        viewportRef={viewportRef}
        handleScroll={handleScroll}
      >
        <ChatLayoutWrapper>{children}</ChatLayoutWrapper>
        <ChatLayoutWrapper className="absolute bottom-0 left-0 right-0">
          <div className="flex absolute bottom-6 w-full pointer-events-none">
            <ScrollToBottomButton
              onClick={scrollToBottom}
              className={cn(
                "mx-auto z-50 pointer-events-auto",
                !positionChecked || isUserAtBottom() ? "scale-0" : "scale-100"
              )}
            />
          </div>
        </ChatLayoutWrapper>
      </ScrollArea>
    </>
  );
}
