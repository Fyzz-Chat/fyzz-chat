import { ChatLayoutWrapper } from "@/components/chat/chat-layout-wrapper";
import ModelStoreInitializer from "@/components/chat/model-store-initializer";
import InputForm from "@/components/input-form";
import { getProvidersPublic } from "@/lib/backend/providers";
import { ChatProvider } from "@/lib/contexts/chat-context";
import type { ReactNode } from "react";

export default async function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  const providers = getProvidersPublic();

  return (
    <ChatProvider>
      <ModelStoreInitializer providers={providers} />
      <div className="relative flex flex-1 flex-col min-w-[320px] max-h-svh bg-background md:rounded-[20px]">
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
