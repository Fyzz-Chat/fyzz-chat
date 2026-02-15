import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function ThinkingIndicator({ reasoning }: Readonly<{ reasoning: string }>) {
  const [isReasoning, setIsReasoning] = useState(true);
  const prevReasoningRef = useRef(reasoning);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only update if reasoning has actually changed
    if (reasoning !== prevReasoningRef.current) {
      setIsReasoning(true);
      prevReasoningRef.current = reasoning;
    }

    // Set a timeout to mark reasoning as finished
    timeoutRef.current = setTimeout(() => {
      setIsReasoning(false);
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [reasoning]);

  return (
    <Sheet>
      <SheetTrigger>
        <span className="text-muted-foreground text-sm">
          {isReasoning ? "Reasoning..." : "Reasoning finished"}
        </span>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Thought Process</SheetTitle>
          <SheetDescription className="sr-only">
            Steps taken to generate the response
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="mt-4 h-[calc(100vh-4rem)]">
          <div className="max-w-none text-muted-foreground text-sm">{reasoning}</div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
