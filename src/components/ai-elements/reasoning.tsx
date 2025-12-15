"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { BrainIcon, ChevronDownIcon, Cog } from "lucide-react";
import type { ComponentProps } from "react";
import { createContext, memo, useContext, useEffect, useRef, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Response } from "./response";

type ReasoningContextValue = {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

const useReasoning = () => {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error("Reasoning components must be used within Reasoning");
  }
  return context;
};

export type ReasoningProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
};

const AUTO_CLOSE_DELAY = 1000;
const MS_IN_S = 1000;

export const Reasoning = memo(
  ({
    className,
    isStreaming = false,
    open,
    defaultOpen = true,
    onOpenChange,
    duration: durationProp,
    children,
    ...props
  }: ReasoningProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      prop: open,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    });

    const [hasAutoClosedRef, setHasAutoClosedRef] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);

    // Track duration when streaming starts and ends
    useEffect(() => {
      if (isStreaming) {
        if (startTime === null) {
          setStartTime(Date.now());
        }
      } else if (startTime !== null) {
        setStartTime(null);
      }
    }, [isStreaming, startTime]);

    // Auto-open when streaming starts, auto-close when streaming ends (once only)
    useEffect(() => {
      if (defaultOpen && !isStreaming && isOpen && !hasAutoClosedRef) {
        // Add a small delay before closing to allow user to see the content
        const timer = setTimeout(() => {
          setIsOpen(false);
          setHasAutoClosedRef(true);
        }, AUTO_CLOSE_DELAY);

        return () => clearTimeout(timer);
      }
    }, [isStreaming, isOpen, defaultOpen, setIsOpen, hasAutoClosedRef]);

    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen);
    };

    return (
      <ReasoningContext.Provider value={{ isStreaming, isOpen, setIsOpen }}>
        <Collapsible
          className={cn("not-prose", className)}
          onOpenChange={handleOpenChange}
          open={isOpen}
          {...props}
        >
          {children}
        </Collapsible>
      </ReasoningContext.Provider>
    );
  }
);

export type ReasoningTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  duration?: number;
};

export const ReasoningTrigger = memo(
  ({ className, children, duration, ...props }: ReasoningTriggerProps) => {
    const { isStreaming, isOpen } = useReasoning();

    return (
      <CollapsibleTrigger
        className={cn("flex items-center gap-2 text-muted-foreground text-sm", className)}
        {...props}
      >
        {children ?? (
          <>
            {isStreaming && !duration ? (
              <div className="flex items-center gap-4">
                <div className="relative animate-pulse text-primary drop-shadow-[0_0_3px_var(--ring)]">
                  <Cog
                    size={12}
                    className="-mt-1 animate-[spin_2s_linear_infinite_reverse]"
                  />
                  <Cog
                    size={16}
                    className="-mt-1 absolute ml-2 animate-[spin_2s_linear_infinite]"
                  />
                </div>
                <p className="animate-pulse text-primary drop-shadow-[0_0_3px_var(--ring)]">
                  Thinking...
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <BrainIcon size={16} />
                <p>
                  Thought for {(duration ? duration / MS_IN_S : 0).toFixed(1)} seconds
                </p>
              </div>
            )}
            <ChevronDownIcon
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                isStreaming && !duration ? "animate-pulse text-primary" : "",
                isOpen ? "rotate-180" : "rotate-0"
              )}
            />
          </>
        )}
      </CollapsibleTrigger>
    );
  }
);

export type ReasoningContentProps = ComponentProps<typeof CollapsibleContent> & {
  children: string;
};

export const ReasoningContent = memo(
  ({ className, children, ...props }: ReasoningContentProps) => {
    const { isOpen, isStreaming } = useReasoning();
    const viewportRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const el = viewportRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, [children, isOpen, isStreaming]);

    return (
      <CollapsibleContent
        className={cn(
          "mt-4 text-sm",
          "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-muted-foreground outline-hidden data-[state=closed]:animate-out data-[state=open]:animate-in",
          className
        )}
        {...props}
      >
        <div className="-mb-6 pointer-events-none relative z-10 h-6 bg-linear-to-b from-background to-transparent" />
        <ScrollArea viewportRef={viewportRef}>
          <div className="max-h-56">
            <Response className="grid gap-2 py-3">{children}</Response>
          </div>
        </ScrollArea>
        <div className="-mt-6 pointer-events-none relative z-10 h-6 bg-linear-to-t from-background to-transparent" />
      </CollapsibleContent>
    );
  }
);

Reasoning.displayName = "Reasoning";
ReasoningTrigger.displayName = "ReasoningTrigger";
ReasoningContent.displayName = "ReasoningContent";
