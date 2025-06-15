"use client";

import { ChatLayoutWrapper } from "@/components/chat/chat-layout-wrapper";
import { ScrollToBottomButton } from "@/components/scroll-to-bottom-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatContext } from "@/lib/contexts/chat-context";
import { cn } from "@/lib/utils";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

export default function MessagesScrollArea({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const { messages } = useChatContext();
  const lastMessage = messages[messages.length - 1];
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

  // Scroll to bottom when the last message changes
  useEffect(() => {
    if (lastMessage && autoScroll) {
      scrollToBottom();
    }
  }, [lastMessage, autoScroll]);

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
    <ScrollArea
      className={cn("", className)}
      viewportRef={viewportRef}
      handleScroll={handleScroll}
    >
      <ChatLayoutWrapper>{children}</ChatLayoutWrapper>
      <ChatLayoutWrapper className="absolute bottom-0 left-0 right-0">
        <ScrollToBottomButton
          onClick={scrollToBottom}
          className={cn(
            "absolute bottom-6 right-4 z-50",
            !positionChecked || isUserAtBottom() ? "scale-0" : "scale-100"
          )}
        />
      </ChatLayoutWrapper>
    </ScrollArea>
  );
}
