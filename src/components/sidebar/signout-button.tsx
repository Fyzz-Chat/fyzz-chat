"use client";

import { useQueryClient } from "@tanstack/react-query";
import { del } from "idb-keyval";
import { LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { signOut } from "@/lib/auth-client";
import { QUERY_CACHE_KEY } from "@/lib/trpc/client";

export function SignOut({ buttonText }: { buttonText: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await del(QUERY_CACHE_KEY);
      queryClient.clear();
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/chat?login=true");
          },
        },
      });
    } catch (_) {
      setIsLoading(false);
    }
  };

  return (
    <SidebarMenuButton className="h-10" onClick={handleSignOut} disabled={isLoading}>
      {isLoading ? (
        <LoaderCircle className="shrink-0 animate-spin" />
      ) : (
        <LogOut className="shrink-0" />
      )}
      <span>{buttonText}</span>
    </SidebarMenuButton>
  );
}
