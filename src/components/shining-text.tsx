import type * as React from "react";
import { cn } from "@/lib/utils";

export default function ShiningText({
  shine = true,
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & { shine?: boolean }) {
  return (
    <span
      className={cn(
        shine &&
          "animate-shine bg-linear-to-r bg-size-[200%_100%] from-background/10 via-foreground to-background/10 bg-clip-text text-transparent",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
