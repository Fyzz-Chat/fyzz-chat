"use client";

import ChatWelcomeSection from "@/components/chat/chat-welcome-section";
import IntroDialog from "@/components/chat/intro-dialog";
import ViewTransitionWrapper from "@/components/view-transition-wrapper";

export default function V4Page() {
  console.log("V4Page");

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <ViewTransitionWrapper className="flex flex-1 items-center justify-center">
        <div className="max-w-2xl w-full space-y-4">
          <ChatWelcomeSection>
            <IntroDialog />
          </ChatWelcomeSection>
        </div>
      </ViewTransitionWrapper>
    </div>
  );
}
