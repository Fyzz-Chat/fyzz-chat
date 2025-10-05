"use client";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

export function ScrollToBottomButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="outline"
      className={cn(
        "text-xs px-2.5 py-1.5 h-fit rounded-full transition-transform duration-200 delay-100",
        className
      )}
      onClick={onClick}
    >
      Click here or press <Kbd>Space</Kbd> to scroll to bottom
    </Button>
  );
}
