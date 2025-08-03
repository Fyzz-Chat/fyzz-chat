import { ChatProvider } from "@/components/chat-provider";
import { ChatLayoutWrapper } from "@/components/chat/chat-layout-wrapper";
import InputForm from "@/components/input-form/input-form";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const LazyModelStoreInitializer = dynamic(
  () => import("@/components/chat/model-store-initializer")
);

export default function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ChatProvider>
      <LazyModelStoreInitializer />
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
