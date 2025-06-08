import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useRef, useState } from "react";

interface ThinkingIndicatorProps {
  reasoning: string;
}

export function ThinkingIndicator({ reasoning }: ThinkingIndicatorProps) {
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
        <span className="text-sm text-muted-foreground">
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
        <ScrollArea className="h-[calc(100vh-4rem)] mt-4">
          <div className="max-w-none text-muted-foreground text-sm">{reasoning}</div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
