import { ChatProvider } from "@/components/chat-provider";
import { ChatLayoutWrapper } from "@/components/chat/chat-layout-wrapper";
import ModelStoreInitializer from "@/components/chat/model-store-initializer";
import InputForm from "@/components/input-form/input-form";
import type { ReactNode } from "react";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <ChatProvider>
      <ModelStoreInitializer />
      <div className="relative flex flex-1 flex-col pt-14 min-w-[320px] max-h-svh bg-background md:rounded-[20px]">
        <div className="w-full h-px border-b" />
        {children}
        <div className="absolute max-w-5xl mx-auto bottom-0 left-0 right-0">
          <div className="relative h-6 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
          <ChatLayoutWrapper>
            <InputForm />
          </ChatLayoutWrapper>
        </div>
      </div>
    </ChatProvider>
  );
}
