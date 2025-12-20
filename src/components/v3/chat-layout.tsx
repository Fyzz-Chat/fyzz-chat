import { Outlet } from "react-router-dom";
import ModelStoreInitializer from "@/components/chat/model-store-initializer";
import { ChatProvider } from "@/components/chat-provider";
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
      <div className="relative flex max-h-svh min-w-[320px] flex-1 flex-col pt-14">
        <div className="h-px w-full border-b" />
        <Outlet />
      </div>
    </ChatProvider>
  );
}
