import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { MockAppSidebar } from "@/app/mock/mock-app-sidebar";
import MockChatSidebar from "@/app/mock/mock-chat-sidebar";
import MockInput from "@/app/mock/mock-input";
import Pad from "@/app/mock/pad";
import AuthPopup from "@/components/auth/auth-popup";
import { ChatLayoutProvider } from "@/components/chat/chat-layout-provider";
import ModelStoreInitializer from "@/components/chat/model-store-initializer";
import { EnterHandler, EscapeHandler } from "@/components/key-handler";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import conf from "@/lib/config";
import { InitialMessageProvider } from "@/lib/contexts/initial-message-context";
import { MockInputProvider } from "@/lib/contexts/mock-input-context";
import { getUserFromSessionPublic } from "@/lib/dao/users";
import { caller } from "@/lib/trpc/server";

export default async function Layout({ children }: { children: ReactNode }) {
  const userPromise = getUserFromSessionPublic();
  const conversationsPromise = userPromise.then((user) =>
    user
      ? caller.infiniteConversations({ limit: 15, search: "" })
      : { items: [], nextCursor: undefined }
  );

  const [cookieStore, user, providers, initialConversationsData] = await Promise.all([
    cookies(),
    userPromise,
    caller.providers(),
    conversationsPromise,
  ]);

  const sidebarState = cookieStore.get("sidebar:state");
  const isLoggedIn = Boolean(user);
  const existingSidebarState = sidebarState ? sidebarState.value === "true" : true;
  const defaultOpen = isLoggedIn ? existingSidebarState : false;
  const hasGoogle = Boolean(conf.googleId) && Boolean(conf.googleSecret);

  return (
    <InitialMessageProvider>
      <MockInputProvider>
        <EnterHandler />
        <EscapeHandler />
        <ModelStoreInitializer providers={providers} />
        <ChatLayoutProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <MockAppSidebar>
              <MockChatSidebar
                conversations={initialConversationsData}
                authorized={isLoggedIn}
              />
            </MockAppSidebar>
            <SidebarInset className="relative flex flex-col overflow-auto md:pb-4">
              <SidebarTrigger className="absolute top-2.5 left-2 z-20 size-8 touch-manipulation p-5" />
              {!isLoggedIn && (
                <div className="absolute top-2 right-2 z-20">
                  <AuthPopup anonymousLogin={conf.anonymousLogin} hasGoogle={hasGoogle} />
                </div>
              )}
              <div className="flex-1">{children}</div>
              <MockInput />
              <Pad />
            </SidebarInset>
          </SidebarProvider>
        </ChatLayoutProvider>
      </MockInputProvider>
    </InitialMessageProvider>
  );
}
