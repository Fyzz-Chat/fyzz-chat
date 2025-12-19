import ChatWelcomeSection from "@/components/chat/chat-welcome-section";
import IntroDialog from "@/components/chat/intro-dialog";
import ViewTransitionWrapper from "@/components/view-transition-wrapper";

export default function V3Page() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <ViewTransitionWrapper className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-2xl space-y-4">
          <ChatWelcomeSection>
            <IntroDialog />
          </ChatWelcomeSection>
        </div>
      </ViewTransitionWrapper>
    </div>
  );
}
