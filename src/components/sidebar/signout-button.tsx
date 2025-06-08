"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { SidebarMenuButton } from "../ui/sidebar";

export function SignOut() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
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
      <span>Sign Out</span>
    </SidebarMenuButton>
  );
}
