"use client";

import { MessagesList } from "@/components/message-list";
import MessagesScrollArea from "@/components/messages-scroll-area";
import { useParams } from "@/components/v4/client-router";
import ViewTransitionWrapper from "@/components/view-transition-wrapper";

export default function V4IdTempPage() {
  const { id } = useParams();

  return (
    <ViewTransitionWrapper>
      <MessagesScrollArea className="relative h-[calc(100svh-170px)] md:h-[calc(100svh-198px)]">
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
        <MessagesList id={id as string} />
      </MessagesScrollArea>
    </ViewTransitionWrapper>
  );
}
