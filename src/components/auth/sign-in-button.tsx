"use client";

import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { AuthContext } from "@/lib/contexts/auth-context";

export function SignInButton() {
  const { setDialogOpen } = useContext(AuthContext);
  const { setOpenMobile } = useSidebar();

  const handleClick = () => {
    setOpenMobile(false);
    setDialogOpen(true);
  };

  return (
    <Button className="w-full" onClick={handleClick}>
      Log in
    </Button>
  );
}
