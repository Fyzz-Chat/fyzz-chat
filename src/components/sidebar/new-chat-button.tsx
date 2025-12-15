"use client";

import { SquarePenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FastLink } from "@/components/v3/fast-link";

export function NewChatButton() {
  return (
    <Button asChild variant="ghost" className="size-8 touch-manipulation p-5" size="icon">
      <FastLink to="/chat">
        <SquarePenIcon className="size-5" />
      </FastLink>
    </Button>
  );
}
