"use client";

import { CheckIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function LastUsedIndicator({
  provider,
  className,
}: {
  provider: string;
  className?: string;
}) {
  const [isLastUsed, setIsLastUsed] = useState(false);

  useEffect(() => {
    const lastUsed = localStorage.getItem("fyzz-auth-method") === provider;
    setIsLastUsed(lastUsed);
  }, [provider]);

  return (
    isLastUsed && (
      <div
        className={cn(
          "fade-in zoom-in absolute -top-1 -right-6 flex animate-in items-center gap-1.5 rounded-md bg-linear-to-br from-primary to-primary/80 px-2.5 py-1 shadow-lg duration-300",
          "rotate-10",
          className
        )}
        style={{
          transformOrigin: "top right",
        }}
      >
        <CheckIcon size={12} className="text-primary-foreground" strokeWidth={3} />
        <span className="font-semibold text-primary-foreground text-xs leading-none">
          Last used
        </span>
      </div>
    )
  );
}
