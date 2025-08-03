"use client";

import { FastLink } from "@/components/fast-link";
import type { Translations } from "@/types/locale";
import { ExternalLink, FileText, Settings } from "lucide-react";
import { use } from "react";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { SignIn } from "./signin-button";
import { SignOut } from "./signout-button";

export default function ProfileMenu({
  authorized,
  userEmail,
  translationsPromise,
}: {
  authorized: boolean;
  translationsPromise: Promise<Translations>;
  userEmail?: string;
}) {
  const translations = use(translationsPromise);
  return (
    <>
      <DropdownMenuLabel className="font-normal opacity-80">
        {userEmail || translations.sidebar.menu.myAccount}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="p-0 h-10">
        <a
          href="/privacy-policy"
          target="_blank"
          className="flex items-center gap-2 size-full px-2 py-1.5"
        >
          <FileText className="shrink-0" />
          <span className="relative">
            {translations.sidebar.menu.privacyPolicy}
            <ExternalLink className="absolute -top-0 -right-4 !w-3 !h-3" />
          </span>
        </a>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {authorized && (
        <>
          <DropdownMenuItem className="p-0 h-10 cursor-pointer" asChild>
            <FastLink
              href="/settings"
              className="flex items-center gap-2 size-full px-2 py-1.5"
            >
              <Settings className="shrink-0" />
              <span>{translations.sidebar.menu.settings}</span>
            </FastLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}
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
