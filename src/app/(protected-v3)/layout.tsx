import { ChatLayoutProvider } from "@/components/chat/chat-layout-provider";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ClientRouter from "@/components/v2/client-router";
import conf from "@/lib/config";
import { cookies } from "next/headers";
import { Outlet } from "react-router-dom";

export default async function Layout() {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar:state");
  const defaultOpen = sidebarState ? sidebarState.value === "true" : true;
  const jwtConfigured = conf.jwtSecret !== "";

  return (
    <ClientRouter jwtConfigured={jwtConfigured}>
      <ChatLayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset className="relative md:p-2 bg-sidebar overflow-auto">
            <SidebarTrigger className="absolute size-8 top-2 left-2 md:top-4 md:left-4 z-20 p-5 touch-manipulation" />
            <Outlet />
          </SidebarInset>
        </SidebarProvider>
      </ChatLayoutProvider>
    </ClientRouter>
  );
}
