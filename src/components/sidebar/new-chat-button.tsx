"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { SquarePenIcon } from "lucide-react";
import { FastLink } from "../fast-link";

export function NewChatButton() {
  const { isMobile, setOpenMobile } = useSidebar();

  function handleClick() {
    isMobile && setOpenMobile(false);
  }

  return (
    <Button asChild variant="ghost" className="size-8 p-5 touch-manipulation" size="icon">
      <FastLink href="/chat" prefetch onClick={handleClick}>
        <SquarePenIcon className="size-5" />
      </FastLink>
    </Button>
  );
}
