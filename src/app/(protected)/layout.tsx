import { ChatLayoutProvider } from "@/components/chat/chat-layout-provider";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import type React from "react";
import { unstable_ViewTransition as ViewTransition } from "react";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar:state");
  const defaultOpen = sidebarState ? sidebarState.value === "true" : true;

  return (
    <ViewTransition default="fade">
      <ChatLayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset className="relative md:p-2 bg-sidebar overflow-auto">
            <SidebarTrigger className="absolute size-8 top-4 left-4 z-20 p-5 touch-manipulation" />
            {children}
          </SidebarInset>
        </SidebarProvider>
      </ChatLayoutProvider>
    </ViewTransition>
  );
}
