import { type ReactNode, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function HoverPopover({
  children,
  content,
  triggerAriaLabel,
  stopPropagation = false,
  align = "end",
  side = "right",
}: Readonly<{
  children: ReactNode;
  content: ReactNode;
  triggerAriaLabel?: string;
  stopPropagation?: boolean;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}>) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 10); // Small delay to prevent flickering
  };

  const maybeStopPropagation = (e: { stopPropagation: () => void }) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={triggerAriaLabel}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerDown={maybeStopPropagation}
        onClick={maybeStopPropagation}
        className="inline-flex"
      >
        {children}
      </PopoverTrigger>
      <PopoverContent
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        align={align}
        side={side}
        className="w-fit px-3 py-2"
      >
        <p className="text-sm">{content}</p>
      </PopoverContent>
    </Popover>
  );
}
