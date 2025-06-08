"use client";

import { useChatLayout } from "@/lib/contexts/chat-layout-context";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

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
        "mx-auto",
        layout === "compact" ? "lg:max-w-2xl w-full" : "max-w-5xl w-full",
        className
      )}
    >
      {children}
    </div>
  );
}
