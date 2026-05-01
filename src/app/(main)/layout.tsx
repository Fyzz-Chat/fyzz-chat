import { cookies } from "next/headers";
import { type ReactNode, Suspense } from "react";
import AuthPopup from "@/components/auth/auth-popup";
import { ChatLayoutProvider } from "@/components/chat/chat-layout-provider";
import ModelStoreInitializer from "@/components/chat/model-store-initializer";
import {
  EnterHandler,
  EscapeHandler,
  HomeHandler,
  ModelMenuHandler,
} from "@/components/key-handler";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ChatSidebarWithProjects } from "@/components/sidebar/chat-sidebar-with-projects";
import { HelpDialog } from "@/components/sidebar/help-dialog";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import conf from "@/lib/config";
import { ChatInputProvider } from "@/lib/contexts/chat-input-context";
import { InitialMessageProvider } from "@/lib/contexts/initial-message-context";
import { getUserFromSessionPublic } from "@/lib/dao/users";
import { caller } from "@/lib/trpc/server";

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  const [cookieStore, user] = await Promise.all([cookies(), getUserFromSessionPublic()]);

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
        <Suspense fallback={null}>
          <ProvidersInitializer defaultModel={user?.defaultModel} />
        </Suspense>
        <ChatLayoutProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar user={user}>
              <Suspense fallback={<SidebarDataSkeleton />}>
                <SidebarData isLoggedIn={isLoggedIn} />
              </Suspense>
            </AppSidebar>
            <SidebarInset className="relative flex flex-col gap-4 overflow-auto md:pb-4">
              <SidebarTrigger className="absolute top-2.5 left-2 z-20 size-8 touch-manipulation p-5" />
              <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                {!isLoggedIn && (
                  <AuthPopup anonymousLogin={conf.anonymousLogin} hasGoogle={hasGoogle} />
                )}
              </div>
              {children}
            </SidebarInset>
          </SidebarProvider>
        </ChatLayoutProvider>
      </ChatInputProvider>
    </InitialMessageProvider>
  );
}

async function ProvidersInitializer({ defaultModel }: { defaultModel?: string | null }) {
  const providers = await caller.providers();
  return <ModelStoreInitializer providers={providers} defaultModel={defaultModel} />;
}

async function SidebarData({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (!isLoggedIn) {
    return (
      <ChatSidebarWithProjects
        conversations={{ items: [], nextCursor: undefined }}
        projects={{ projects: [] }}
        authorized={false}
      />
    );
  }
  const [conversations, projects] = await Promise.all([
    caller.infiniteConversations({ limit: 15, search: "" }),
    caller.projects(),
  ]);
  return (
    <ChatSidebarWithProjects
      conversations={conversations}
      projects={projects}
      authorized
    />
  );
}

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"];

function SidebarDataSkeleton() {
  return (
    <div className="flex flex-col gap-2 px-2 py-2">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <div className="my-2 h-px bg-border" />
      <Skeleton className="h-6 w-32" />
      {SKELETON_KEYS.map((key) => (
        <Skeleton key={key} className="h-7 w-full" />
      ))}
    </div>
  );
}
