"use client";

import { Button } from "@/components/ui/button";
import { FastLink } from "@/components/v3/fast-link";
import { SquarePenIcon } from "lucide-react";

export function NewChatButton() {
  return (
    <Button asChild variant="ghost" className="size-8 p-5 touch-manipulation" size="icon">
      <FastLink to="/chat">
        <SquarePenIcon className="size-5" />
      </FastLink>
    </Button>
  );
}
