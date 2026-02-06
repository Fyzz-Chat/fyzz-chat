"use client";

import { SquarePenIcon } from "lucide-react";
import { FastLink } from "@/app/mock/fast-link";
import { Button } from "@/components/ui/button";

export function MockNewChatButton() {
  return (
    <Button asChild variant="ghost" className="size-8 touch-manipulation p-5" size="icon">
      <FastLink href="/mock">
        <SquarePenIcon className="size-5" />
      </FastLink>
    </Button>
  );
}
