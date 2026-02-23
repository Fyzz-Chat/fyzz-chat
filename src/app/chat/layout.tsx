import { Github } from "lucide-react";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import AuthPopup from "@/components/auth/auth-popup";
import ChatInput from "@/components/chat/chat-input";
import { ChatLayoutProvider } from "@/components/chat/chat-layout-provider";
import ModelStoreInitializer from "@/components/chat/model-store-initializer";
import Pad from "@/components/chat/pad";
import {
  EnterHandler,
  EscapeHandler,
  HomeHandler,
  ModelMenuHandler,
} from "@/components/key-handler";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import ChatSidebar from "@/components/sidebar/chat-sidebar";
import { HelpDialog } from "@/components/sidebar/help-dialog";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import conf from "@/lib/config";
import { ChatInputProvider } from "@/lib/contexts/chat-input-context";
import { InitialMessageProvider } from "@/lib/contexts/initial-message-context";
import { getUserFromSessionPublic } from "@/lib/dao/users";
import { caller } from "@/lib/trpc/server";

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
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
      <ChatInputProvider>
        <EnterHandler />
        <EscapeHandler />
        <HomeHandler />
        <ModelMenuHandler />
        <HelpDialog />
        <ModelStoreInitializer providers={providers} />
        <ChatLayoutProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar>
              <ChatSidebar
                conversations={initialConversationsData}
                authorized={isLoggedIn}
              />
            </AppSidebar>
            <SidebarInset className="relative flex flex-col gap-4 overflow-auto md:pb-4">
              <SidebarTrigger className="absolute top-2.5 left-2 z-20 size-8 touch-manipulation p-5" />
              <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                {!isLoggedIn && (
                  <AuthPopup anonymousLogin={conf.anonymousLogin} hasGoogle={hasGoogle} />
                )}
                <a
                  href="https://github.com/Fyzz-Chat/fyzz-chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Star us on GitHub"
                  className="rounded-full p-2 text-muted-foreground/50 transition-colors hover:text-foreground"
                >
                  <Github className="size-5" />
                </a>
              </div>
              <div className="flex-1">{children}</div>
              <Pad>
                <ChatInput />
              </Pad>
            </SidebarInset>
          </SidebarProvider>
        </ChatLayoutProvider>
      </ChatInputProvider>
    </InitialMessageProvider>
  );
}
