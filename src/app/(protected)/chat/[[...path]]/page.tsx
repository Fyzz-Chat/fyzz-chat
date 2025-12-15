import "katex/dist/katex.min.css";

import { cookies } from "next/headers";
import { Outlet } from "react-router-dom";
import AuthPopup from "@/components/auth/auth-popup";
import { ChatLayoutProvider } from "@/components/chat/chat-layout-provider";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import ChatSidebar from "@/components/sidebar/chat-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ClientRouter from "@/components/v3/client-router";
import conf from "@/lib/config";
import { getUserFromSessionPublic } from "@/lib/dao/users";
import { caller } from "@/lib/trpc/server";

export default async function CatchAll({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar:state");
  const defaultOpen = sidebarState ? sidebarState.value === "true" : true;
  const jwtConfigured = conf.jwtSecret !== "";
  const user = await getUserFromSessionPublic();
  const initialConversationsData = user
    ? await caller.infiniteConversations({
        limit: 15,
        search: "",
      })
    : { items: [], nextCursor: undefined };

  return (
    <ClientRouter jwtConfigured={jwtConfigured}>
      <ChatLayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar>
            <ChatSidebar
              conversations={initialConversationsData}
              authorized={Boolean(user)}
            />
          </AppSidebar>
          <SidebarInset className="relative md:p-2 bg-sidebar overflow-auto">
            <SidebarTrigger className="absolute size-8 top-2 left-2 md:top-4 md:left-4 z-20 p-5 touch-manipulation" />
            <AuthPopup searchParams={searchParamsPromise} />
            <Outlet />
          </SidebarInset>
        </SidebarProvider>
      </ChatLayoutProvider>
    </ClientRouter>
  );
}
