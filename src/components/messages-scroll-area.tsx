"use client";

import { useChatContext } from "@/lib/contexts/chat-context";
import { cn } from "@/lib/utils";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { ChatLayoutWrapper } from "./chat/chat-layout-wrapper";
import { ScrollArea } from "./ui/scroll-area";

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

  const isUserAtBottom = () => {
    const viewport = viewportRef.current;
    if (!viewport) return false;
    return viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 10;
  };

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
    </ScrollArea>
  );
}
