import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function LandingWrap({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1180px] px-[clamp(1.25rem,5vw,4rem)]",
        className
      )}
    >
      {children}
    </div>
  );
}
