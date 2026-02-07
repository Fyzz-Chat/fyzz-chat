"use client";

import type { ReactNode } from "react";
import { useChatLayout } from "@/lib/contexts/chat-layout-context";
import { cn } from "@/lib/utils";

export function ChatLayoutWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { layout } = useChatLayout();

  return (
    <div
      className={cn(
        "mx-auto w-full",
        layout === "compact" ? "lg:max-w-2xl" : "max-w-5xl",
        className
      )}
    >
      {children}
    </div>
  );
}
