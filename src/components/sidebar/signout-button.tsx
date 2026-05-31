"use client";

import { useQueryClient } from "@tanstack/react-query";
import { del } from "idb-keyval";
import { LoaderCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { signOut } from "@/lib/auth-client";
import { QUERY_CACHE_KEY } from "@/lib/trpc/client";
import { INPUT_STORAGE_KEY } from "@/lib/utils";

export function SignOut({ buttonText }: Readonly<{ buttonText: string }>) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      queryClient.clear();
      await del(QUERY_CACHE_KEY);
      localStorage.removeItem(INPUT_STORAGE_KEY);
      await signOut();
    } catch (_) {
      // sign out even if the server call fails
    } finally {
      window.location.href = "/chat";
    }
  };

  return (
    <SidebarMenuButton onClick={handleSignOut} disabled={isLoading}>
      {isLoading ? (
        <LoaderCircle className="shrink-0 animate-spin" />
      ) : (
        <LogOut className="shrink-0" />
      )}
      <span>{buttonText}</span>
    </SidebarMenuButton>
  );
}
