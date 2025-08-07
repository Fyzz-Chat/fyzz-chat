"use client";

import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarMenuButton, useSidebar } from "../ui/sidebar";

export function SignIn({ buttonText }: { buttonText: string }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate();

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    navigate("/chat?login=true");
  };

  return (
    <SidebarMenuButton className="h-10" onClick={handleClick}>
      <LogIn className="shrink-0" />
      <span>{buttonText}</span>
    </SidebarMenuButton>
  );
}
