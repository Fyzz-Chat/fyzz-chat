"use client";

import { Command, ExternalLink, FileText, Settings } from "lucide-react";
import { use } from "react";
import { FastLink } from "@/components/fast-link";
import { SignOut } from "@/components/sidebar/signout-button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { useTranslations } from "@/lib/contexts/translations-context";
import { useUIStore } from "@/stores/ui-store";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function ProfileMenu({
  userName,
  userEmail,
  userImage,
}: {
  userName: string;
  userEmail: string;
  userImage?: string;
}) {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const setHelpOpen = useUIStore((state) => state.setHelpOpen);

  return (
    <DropdownMenuContent
      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      align="end"
      sideOffset={4}
    >
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="rounded-lg">
              {userName
                ?.split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("") || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{userName || "Anonymous"}</span>
            <span className="truncate text-xs">{userEmail}</span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault();
          setHelpOpen(true);
        }}
        className="cursor-pointer px-2 py-1.5"
      >
        <Command className="shrink-0" />
        <span>{translations.sidebar.menu.help}</span>
        <Kbd className="ml-auto">?</Kbd>
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer p-0" asChild>
        <FastLink
          href="/settings"
          className="flex size-full items-center gap-2 px-2 py-1.5"
        >
          <Settings className="shrink-0" />
          <span>{translations.sidebar.menu.settings}</span>
        </FastLink>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="p-0">
        <a
          href="/privacy-policy"
          target="_blank"
          className="flex size-full items-center gap-2 px-2 py-1.5"
          rel="noopener"
        >
          <FileText className="shrink-0" />
          <span className="relative">
            {translations.sidebar.menu.privacyPolicy}
            <ExternalLink className="absolute top-0 -right-4 h-3! w-3!" />
          </span>
        </a>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <SignOut buttonText={translations.sidebar.menu.signOut} />
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
