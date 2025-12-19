"use client";

import { Command, ExternalLink, FileText, Settings } from "lucide-react";
import { use } from "react";
import { FastLink } from "@/components/fast-link";
import { SignIn } from "@/components/sidebar/signin-button";
import { SignOut } from "@/components/sidebar/signout-button";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { useTranslations } from "@/lib/contexts/translations-context";
import { useHelpDialogStore } from "@/stores/help-dialog-store";

export default function ProfileMenu({
  authorized,
  userEmail,
}: {
  authorized: boolean;
  userEmail?: string;
}) {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const setHelpOpen = useHelpDialogStore((state) => state.setHelpOpen);

  return (
    <>
      <DropdownMenuLabel className="font-normal opacity-80">
        {userEmail || translations.sidebar.menu.myAccount}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault();
          setHelpOpen(true);
        }}
        className="h-10 cursor-pointer px-2 py-1.5"
      >
        <Command className="shrink-0" />
        <span>{translations.sidebar.menu.help}</span>
        <Kbd className="ml-auto">?</Kbd>
      </DropdownMenuItem>
      {authorized && (
        <>
          <DropdownMenuItem className="h-10 cursor-pointer p-0" asChild>
            <FastLink
              href="/settings"
              className="flex size-full items-center gap-2 px-2 py-1.5"
            >
              <Settings className="shrink-0" />
              <span>{translations.sidebar.menu.settings}</span>
            </FastLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuItem className="h-10 p-0">
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
        {authorized ? (
          <SignOut buttonText={translations.sidebar.menu.signOut} />
        ) : (
          <SignIn buttonText={translations.sidebar.menu.signIn} />
        )}
      </DropdownMenuItem>
    </>
  );
}
