"use client";

import { ChevronsUpDown } from "lucide-react";
import { SignInButton } from "@/components/auth/sign-in-button";
import ProfileMenu from "@/components/sidebar/profile-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import type { SessionUser } from "@/lib/dao/users";

export function SidebarUserMenu({ user }: { user: SessionUser | null }) {
  if (!user) {
    return <SignInButton />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.image || ""} alt={user.name || "U"} />
            <AvatarFallback className="rounded-lg">
              {user.name
                ?.split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("") || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name || "Anonymous"}</span>
            {user.email && <span className="truncate text-xs">{user.email}</span>}
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
  );
}
