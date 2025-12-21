"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import type { ToolUIPart } from "ai";
import { ChevronDownIcon, WrenchIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, memo, useContext, useMemo } from "react";
import ShiningText from "@/components/shining-text";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { CodeInterpreterOutput } from "@/types/tools";
import { CodeBlock } from "./code-block";

type ToolContextValue = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const ToolContext = createContext<ToolContextValue | null>(null);

const useTool = () => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error("Tool components must be used within Tool");
  }
  return context;
};

export type ToolProps = ComponentProps<typeof Collapsible> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const Tool = memo(
  ({ className, open, onOpenChange, children, ...props }: ToolProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      prop: open,
      defaultProp: false,
      onChange: onOpenChange,
    });

    const contextValue = useMemo(() => ({ isOpen, setIsOpen }), [isOpen, setIsOpen]);

    return (
      <ToolContext.Provider value={contextValue}>
        <Collapsible
          className={cn("not-prose", className)}
          onOpenChange={setIsOpen}
          open={isOpen}
          {...props}
        >
          {children}
        </Collapsible>
      </ToolContext.Provider>
    );
  }
);

export type ToolHeaderProps = {
  type: ToolUIPart["type"];
  state: ToolUIPart["state"];
  className?: string;
};

export const ToolHeader = memo(
  ({ className, type, state, ...props }: ToolHeaderProps) => {
    const { isOpen } = useTool();

    return (
      <CollapsibleTrigger
        className={cn(
          "group/tool flex items-center gap-2 text-muted-foreground text-sm",
          className
        )}
        {...props}
      >
        {state === "input-streaming" || state === "input-available" ? (
          <div className="flex items-center gap-4">
            <p className="animate-pulse text-primary drop-shadow-[0_0_3px_var(--ring)]">
              <ShiningText>Using {type}...</ShiningText>
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <WrenchIcon size={16} />
            <p>Used {type}</p>
          </div>
        )}
        <ChevronDownIcon
          className={cn(
            "size-4 text-muted-foreground opacity-0 transition-all group-hover/tool:opacity-100",
            isOpen ? "rotate-0 opacity-100" : "-rotate-90"
          )}
        />
      </CollapsibleTrigger>
    );
  }
);

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({ className, ...props }: ToolContentProps) => (
  <CollapsibleContent
    className={cn(
      "mt-4 text-sm",
      "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-muted-foreground outline-hidden data-[state=closed]:animate-out data-[state=open]:animate-in",
      className
    )}
    {...props}
  />
);

export type ToolInputProps = ComponentProps<"div"> & {
  input: ToolUIPart["input"];
};

export const ToolInput = ({ className, input, ...props }: ToolInputProps) => (
  <div className={cn("space-y-2 overflow-hidden p-4", className)} {...props}>
    <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
      Parameters
    </h4>
    <div className="rounded-md bg-muted/50">
      <CodeBlock code={JSON.stringify(input, null, 2)} language="json" />
    </div>
  </div>
);

export type ToolOutputProps = ComponentProps<"div"> & {
  output: ReactNode;
  errorText: ToolUIPart["errorText"];
};

export const ToolOutput = memo(
  ({ className, output, errorText, ...props }: ToolOutputProps) => {
    if (!(output || errorText)) {
      return null;
    }

    return (
      <div className={cn("space-y-2 p-4", className)} {...props}>
        <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          {errorText ? "Error" : "Result"}
        </h4>
        <div
          className={cn(
            "overflow-x-auto rounded-md text-xs [&_table]:w-full",
            errorText ? "bg-destructive/10 text-destructive" : "text-foreground"
          )}
        >
          {errorText && <div>{errorText}</div>}
          {output && <div>{output}</div>}
        </div>
      </div>
    );
  }
);

type OpenAICodeInterpreterOutputProps = ComponentProps<"div"> & {
  output: CodeInterpreterOutput;
  errorText: ToolUIPart["errorText"];
};

export const OpenAICodeInterpreterOutput = memo(
  ({ className, output, errorText, ...props }: OpenAICodeInterpreterOutputProps) => {
    const formattedOutput = output?.outputs?.map((output, index) => (
      <div key={`${index}-output`} className="flex flex-col gap-2">
        {output.type === "logs" && <div className="font-mono">{output.logs}</div>}
        {output.type === "image" && <div>{output.url}</div>}
      </div>
    ));
    return (
      <ToolOutput
        output={formattedOutput}
        errorText={errorText}
        className={className}
        {...props}
      />
    );
  }
);
