import { ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { SignInButton } from "@/components/auth/sign-in-button";
import { NewChatButton } from "@/components/sidebar/new-chat-button";
import ProfileMenu from "@/components/sidebar/profile-menu";
import { SearchField } from "@/components/sidebar/search-field";
import StatusNotification from "@/components/sidebar/status-notification";
import { SwipeDetector } from "@/components/sidebar/swipe-detector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  const [user, version] = await Promise.all([getUserFromSessionPublic(), getVersion()]);

  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader>
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
          <div className="flex items-center pt-2">
            <SearchField />
          </div>
          <StatusNotification />
        </SidebarHeader>
        <SidebarContent className="relative">
          <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-4 bg-linear-to-b from-sidebar to-transparent" />
          {children}
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-4 bg-linear-to-t from-sidebar to-transparent" />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={user?.image || ""} alt={user?.name} />
                        <AvatarFallback className="rounded-lg">
                          {user?.name
                            ?.split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("") || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {user?.name || "Anonymous"}
                        </span>
                        {user?.email && (
                          <span className="truncate text-xs">{user.email}</span>
                        )}
                      </div>
                      <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <ProfileMenu
                    userName={user.name}
                    userEmail={user.email}
                    userImage={user.image || undefined}
                  />
                </DropdownMenu>
              ) : (
                <SignInButton />
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SwipeDetector />
    </>
  );
}
