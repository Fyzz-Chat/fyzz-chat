import { useParams } from "react-router-dom";
import { ChatLayoutWrapper } from "@/components/chat/chat-layout-wrapper";
import ShareConversationButton from "@/components/chat/share-conversation-button";
import InputForm from "@/components/input-form/input-form";
import { MessagesList } from "@/components/message-list";
import MessagesScrollArea from "@/components/messages-scroll-area";
import ViewTransitionWrapper from "@/components/view-transition-wrapper";

export default function V3IdPage({ jwtConfigured }: { jwtConfigured: boolean }) {
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
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-6 bg-linear-to-b from-background to-transparent" />
        <MessagesList id={id as string} />
      </MessagesScrollArea>
      <div className="absolute right-0 bottom-0 left-0 mx-auto max-w-5xl">
        <div className="pointer-events-none relative z-10 h-6 bg-linear-to-t from-background to-transparent" />
        <ChatLayoutWrapper>
          <InputForm />
        </ChatLayoutWrapper>
      </div>
    </ViewTransitionWrapper>
  );
}
