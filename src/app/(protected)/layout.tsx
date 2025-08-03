import { ChatLayoutProvider } from "@/components/chat/chat-layout-provider";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getTranslations } from "@/lib/backend/locale/dictionaries";
import { cookies } from "next/headers";
import type React from "react";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const translationsPromise = getTranslations();
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar:state");
  const defaultOpen = sidebarState ? sidebarState.value === "true" : true;

  return (
    <ChatLayoutProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar translationsPromise={translationsPromise} />
        <SidebarInset className="relative md:p-2 bg-sidebar overflow-auto">
          <SidebarTrigger className="absolute size-8 top-2 left-2 md:top-4 md:left-4 z-20 p-5 touch-manipulation" />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ChatLayoutProvider>
  );
}
