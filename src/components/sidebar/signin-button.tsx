"use client";

import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { SidebarMenuButton, useSidebar } from "../ui/sidebar";

export function SignIn() {
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    router.push("/chat?login=true");
  };

  return (
    <SidebarMenuButton className="h-10" onClick={handleClick}>
      <LogIn className="shrink-0" />
      <span>Sign In</span>
    </SidebarMenuButton>
  );
}
