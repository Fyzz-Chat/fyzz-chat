import Link from "next/link";
import type { ReactNode } from "react";
import { FyzzLogo } from "@/components/fyzz-logo";
import { NewChatButton } from "@/components/sidebar/new-chat-button";
import { SearchField } from "@/components/sidebar/search-field";
import { SidebarUserMenu } from "@/components/sidebar/sidebar-user-menu";
import StatusNotification from "@/components/sidebar/status-notification";
import { SwipeDetector } from "@/components/sidebar/swipe-detector";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getVersion } from "@/lib/backend/utils";
import type { SessionUser } from "@/lib/dao/users";

export function AppSidebar({
  user,
  children,
}: Readonly<{ user: SessionUser | null; children: ReactNode }>) {
  const version = getVersion();

  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader>
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex gap-2">
              <Link href="/chat" className="flex items-center justify-start gap-2">
                <FyzzLogo width={50} height={24} />
              </Link>
              <div className="flex place-items-end">
                <a
                  href={`https://github.com/Fyzz-Chat/fyzz-chat/releases/tag/v${version}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-autotext-muted-foreground text-xs"
                >
                  {version}
                </a>
              </div>
            </div>
            <NewChatButton />
          </div>
          <div className="flex items-center pt-2">
            <SearchField />
          </div>
          <StatusNotification />
        </SidebarHeader>
        <div className="relative flex min-h-0 flex-1 flex-col">
          <SidebarContent className="no-scrollbar">{children}</SidebarContent>
          <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-4 bg-linear-to-b from-sidebar via-sidebar/85 to-transparent" />
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-4 bg-linear-to-t from-sidebar via-sidebar/85 to-transparent" />
        </div>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarUserMenu user={user} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SwipeDetector />
    </>
  );
}
