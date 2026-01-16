import { useParams } from "react-router-dom";
import { ChatLayoutWrapper } from "@/components/chat/chat-layout-wrapper";
import InputForm from "@/components/input-form/input-form";
import { MessagesList } from "@/components/message-list";
import ViewTransitionWrapper from "@/components/view-transition-wrapper";

export default function V3IdTempPage() {
  const { id } = useParams();

  return (
    <ViewTransitionWrapper>
      <div className="relative h-[calc(100svh-170px)] md:h-[calc(100svh-183px)]">
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-6 bg-linear-to-b from-background to-transparent" />
        <MessagesList id={id as string} />
      </div>
      <div className="absolute right-0 bottom-0 left-0 mx-auto max-w-5xl">
        <div className="pointer-events-none relative z-10 h-6 bg-linear-to-t from-background to-transparent" />
        <ChatLayoutWrapper>
          <InputForm />
        </ChatLayoutWrapper>
      </div>
    </ViewTransitionWrapper>
  );
}
