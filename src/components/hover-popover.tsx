import { type ReactNode, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function HoverPopover({
  children,
  content,
  align = "end",
  side = "right",
}: {
  children: ReactNode;
  content: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}) {
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex"
      >
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          align={align}
          side={side}
          className="w-fit px-3 py-2"
        >
          <p className="text-sm">{content}</p>
        </PopoverContent>
      </div>
    </Popover>
  );
}
