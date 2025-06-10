"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { ExternalLink, FileText, Settings } from "lucide-react";
import Link from "next/link";
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
}: {
  authorized: boolean;
  userEmail: string;
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <>
      <DropdownMenuLabel className="font-normal opacity-80">
        {userEmail}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="p-0 h-10">
        <a
          href="/privacy-policy"
          target="_blank"
          className="flex items-center gap-2 size-full px-2 py-1.5"
          onClick={() => isMobile && setOpenMobile(false)}
        >
          <FileText className="shrink-0" />
          <span className="relative">
            Privacy Policy
            <ExternalLink className="absolute -top-0 -right-4 !w-3 !h-3" />
          </span>
        </a>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {authorized && (
        <>
          <DropdownMenuItem className="p-0 h-10 cursor-pointer" asChild>
            <Link
              href="/settings"
              className="flex items-center gap-2 size-full px-2 py-1.5"
              onClick={() => isMobile && setOpenMobile(false)}
            >
              <Settings className="shrink-0" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuItem asChild>{authorized ? <SignOut /> : <SignIn />}</DropdownMenuItem>
    </>
  );
}
