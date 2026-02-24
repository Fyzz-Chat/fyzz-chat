"use client";

import { SquarePenIcon } from "lucide-react";
import { FastLink } from "@/components/fast-link";
import { Button } from "@/components/ui/button";

export function NewChatButton() {
  return (
    <Button asChild variant="ghost" className="size-8 touch-manipulation p-5" size="icon">
      <FastLink href="/chat">
        <SquarePenIcon className="size-5" />
      </FastLink>
    </Button>
  );
}
