import Image from "next/image";
import type { ReactNode } from "react";
import { NewChatButton } from "@/components/sidebar/new-chat-button";
import ProfileMenu from "@/components/sidebar/profile-menu";
import { SearchField } from "@/components/sidebar/search-field";
import StatusNotification from "@/components/sidebar/status-notification";
import { SwipeDetector } from "@/components/sidebar/swipe-detector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { FastLink } from "@/components/v3/fast-link";
import { getVersion } from "@/lib/backend/utils";
import { getUserFromSessionPublic } from "@/lib/dao/users";

export async function AppSidebar({ children }: { children: ReactNode }) {
  const user = await getUserFromSessionPublic();
  const version = await getVersion();

  return (
    <>
      <Sidebar className="border-none">
        <SidebarHeader className="flex-col gap-4 p-2 pl-4">
          <div className="flex w-full items-center justify-between gap-2">
            <FastLink to="/chat" className="flex items-center justify-start gap-2">
              <Image src="/icon.svg" alt="Fyzz.chat" width={24} height={24} />
              <p className="font-bold text-md">Fyzz.chat</p>
            </FastLink>
            <a
              href={`https://github.com/Fyzz-Chat/fyzz-chat/releases/tag/v${version}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mr-auto text-muted-foreground text-xs"
            >
              {version}
            </a>
            <NewChatButton />
          </div>
          <div className="flex items-center pt-2 pr-2">
            <SearchField />
          </div>
          <StatusNotification />
        </SidebarHeader>
        <SidebarContent className="relative px-2">
          <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-4 bg-linear-to-b from-sidebar to-transparent" />
          {children}
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-4 bg-linear-to-t from-sidebar to-transparent" />
        </SidebarContent>
        <SidebarFooter className="py-4 pr-4 pl-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="h-auto">
                  <SidebarMenuButton>
                    <Avatar className="size-7">
                      <AvatarImage src={user?.image || ""} />
                      <AvatarFallback className="text-muted-foreground">
                        {user?.name
                          ?.split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("") || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <p>{user?.name || "Anonymous"}</p>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 md:w-60">
                  <ProfileMenu authorized={Boolean(user)} userEmail={user?.email} />
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SwipeDetector />
    </>
  );
}
