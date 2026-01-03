"use client";

import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { SidebarMenuButton, useSidebar } from "../ui/sidebar";

export function SignIn({ buttonText }: { buttonText: string }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const router = useRouter();

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    router.push("/chat?login=true");
  };

  return (
    <SidebarMenuButton onClick={handleClick}>
      <LogIn className="shrink-0" />
      <span>{buttonText}</span>
    </SidebarMenuButton>
  );
}
