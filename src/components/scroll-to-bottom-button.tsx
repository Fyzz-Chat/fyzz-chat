"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";

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
      size="icon"
      className={cn("size-9 transition-transform duration-200 delay-100", className)}
      onClick={onClick}
    >
      <ArrowDown size={18} />
    </Button>
  );
}
