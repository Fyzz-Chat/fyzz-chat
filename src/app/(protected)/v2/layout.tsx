import { ChatLayoutWrapper } from "@/components/chat/chat-layout-wrapper";

import { ChatProvider } from "@/components/chat-provider";
import ModelStoreInitializer from "@/components/chat/model-store-initializer";
import InputForm from "@/components/input-form/input-form";
import ClientRouter from "@/components/v2/client-router";
import conf from "@/lib/config";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const jwtConfigured = conf.jwtSecret !== "";

  return (
    <ChatProvider>
      <ModelStoreInitializer />
      <div className="relative flex flex-1 flex-col pt-14 min-w-[320px] max-h-svh bg-background md:rounded-[20px]">
        <div className="w-full h-px border-b" />
        {/* This is the react-router equivalent of passing children */}
        <ClientRouter jwtConfigured={jwtConfigured}>
          <div className="relative flex flex-1 flex-col pt-14 min-w-[320px] max-h-svh bg-background md:rounded-[20px]">
            <div className="w-full h-px border-b" />
            <Outlet />
          </div>
        </ClientRouter>
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
