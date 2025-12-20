import type * as React from "react";
import { cn } from "@/lib/utils";

export function LoadingDots({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="loading-dots"
      className={cn(
        "flex h-[60px] w-fit items-center justify-center space-x-1 rounded-lg bg-muted p-4",
        className
      )}
      {...props}
    >
      <div className="h-1.5 w-1.5 animate-[bounce_1s_infinite_0ms] rounded-full bg-current" />
      <div className="h-1.5 w-1.5 animate-[bounce_1s_infinite_200ms] rounded-full bg-current" />
      <div className="h-1.5 w-1.5 animate-[bounce_1s_infinite_400ms] rounded-full bg-current" />
    </div>
  );
}
