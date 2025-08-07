"use client";

import ShareConversationButton from "@/components/chat/share-conversation-button";
import { MessagesList } from "@/components/message-list";
import MessagesScrollArea from "@/components/messages-scroll-area";
import { useParams } from "@/components/v4/client-router";
import ViewTransitionWrapper from "@/components/view-transition-wrapper";

export default function V4IdPage({
  jwtConfigured,
}: {
  jwtConfigured: boolean;
}) {
  console.log("V4IdPage");

  const { id } = useParams();

  return (
    <ViewTransitionWrapper>
      {/* Hidden element to catch initial focus and prevent share button autofocus */}
      <div tabIndex={-1} className="sr-only" aria-hidden="true" />
      {jwtConfigured && (
        <ShareConversationButton
          conversationId={id as string}
          className="absolute top-2 right-2 z-10"
        />
      )}
      <MessagesScrollArea className="relative h-[calc(100svh-170px)] md:h-[calc(100svh-198px)]">
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
        <MessagesList id={id as string} />
      </MessagesScrollArea>
    </ViewTransitionWrapper>
  );
}
