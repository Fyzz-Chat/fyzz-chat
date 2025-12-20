import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-lg bg-muted px-1 font-medium font-sans text-muted-foreground text-xs",
        "[&_svg:not([class*='size-'])]:size-3",
        "in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10",
        className
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
