import { Outlet } from "react-router-dom";
import { ChatLayoutWrapper } from "@/components/chat/chat-layout-wrapper";
import ModelStoreInitializer from "@/components/chat/model-store-initializer";
import { ChatProvider } from "@/components/chat-provider";
import InputForm from "@/components/input-form/input-form";
import { EnterHandler, EscapeHandler, HomeHandler } from "@/components/key-handler";
import { HelpDialog } from "@/components/sidebar/help-dialog";

export default function ChatLayout() {
  return (
    <ChatProvider>
      <HomeHandler />
      <EnterHandler />
      <EscapeHandler />
      <HelpDialog />
      <ModelStoreInitializer />
      <div className="relative flex max-h-svh min-w-[320px] flex-1 flex-col bg-background pt-14 md:rounded-[20px]">
        <div className="h-px w-full border-b" />
        <Outlet />
        <div className="absolute right-0 bottom-0 left-0 mx-auto max-w-5xl">
          <div className="pointer-events-none relative z-10 h-6 bg-linear-to-t from-background to-transparent" />
          <ChatLayoutWrapper>
            <InputForm />
          </ChatLayoutWrapper>
        </div>
      </div>
    </ChatProvider>
  );
}
