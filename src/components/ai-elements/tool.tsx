"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import type { ToolUIPart } from "ai";
import {
  BrainIcon,
  ChevronDownIcon,
  GlobeIcon,
  LightbulbIcon,
  TrashIcon,
  WrenchIcon,
} from "lucide-react";
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

export type SkillToolHeaderProps = {
  state: ToolUIPart["state"];
  skillName?: string;
  skillId?: string;
  className?: string;
};

export const SkillToolHeader = memo(
  ({ className, state, skillName, skillId }: SkillToolHeaderProps) => {
    const { isOpen } = useTool();
    const label = skillName ?? skillId ?? "";
    const isRunning = state === "input-streaming" || state === "input-available";

    return (
      <CollapsibleTrigger
        className={cn(
          "group/tool flex items-center gap-2 text-muted-foreground text-sm",
          className
        )}
      >
        {isRunning ? (
          <p className="animate-pulse text-primary drop-shadow-[0_0_3px_var(--ring)]">
            <ShiningText>
              {label ? `Activating skill: ${label}...` : "Activating skill..."}
            </ShiningText>
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <LightbulbIcon size={16} />
            <p>{label ? `Skill: ${label}` : "Activated skill"}</p>
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

const MEMORY_TOOL_LABELS: Record<string, { running: string; done: string }> = {
  "tool-store_fact": { running: "Remembering a fact", done: "Remembered a fact" },
  "tool-store_opinion": { running: "Forming an opinion", done: "Formed an opinion" },
  "tool-store_learning": {
    running: "Capturing a learning",
    done: "Captured a learning",
  },
  "tool-store_feedback": { running: "Noting feedback", done: "Noted feedback" },
  "tool-update_opinion": {
    running: "Updating an opinion",
    done: "Updated an opinion",
  },
  "tool-delete_memory": { running: "Removing a memory", done: "Removed a memory" },
};

export type MemoryToolHeaderProps = {
  type: ToolUIPart["type"];
  state: ToolUIPart["state"];
  output?: unknown;
  className?: string;
};

function isRetiredOutput(output: unknown): boolean {
  return typeof output === "string" && output.startsWith("Opinion retired");
}

export const MemoryToolHeader = memo(
  ({ className, type, state, output }: MemoryToolHeaderProps) => {
    const { isOpen } = useTool();
    const retired = type === "tool-update_opinion" && isRetiredOutput(output);
    const labels = retired
      ? { running: "Retiring an opinion", done: "Retired an opinion" }
      : (MEMORY_TOOL_LABELS[type] ?? {
          running: "Using memory tool",
          done: "Used memory tool",
        });
    const isRunning = state === "input-streaming" || state === "input-available";
    const Icon = retired ? TrashIcon : BrainIcon;

    return (
      <CollapsibleTrigger
        className={cn(
          "group/tool flex items-center gap-2 text-muted-foreground text-sm",
          className
        )}
      >
        {isRunning ? (
          <p className="animate-pulse text-primary drop-shadow-[0_0_3px_var(--ring)]">
            <ShiningText>{labels.running}...</ShiningText>
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <Icon size={16} />
            <p>{labels.done}</p>
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
  output?: unknown;
};

function isEmptyObject(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value as Record<string, unknown>).length === 0
  );
}

// Provider-defined tools (e.g. OpenAI web_search) ship an empty `input` and put
// the actual call details in `output.action`. Prefer that when the input is empty.
function pickDisplayedInput(input: ToolUIPart["input"], output: unknown): unknown {
  if (!isEmptyObject(input) || !output || typeof output !== "object") return input;
  const action = (output as Record<string, unknown>).action;
  return action ?? input;
}

export const ToolInput = ({ className, input, output, ...props }: ToolInputProps) => {
  const displayed = pickDisplayedInput(input, output);
  return (
    <div className={cn("space-y-2 p-4", className)} {...props}>
      <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        Parameters
      </h4>
      <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap break-words rounded-md bg-muted/50 p-3 font-mono text-foreground text-xs leading-relaxed">
        {JSON.stringify(displayed, null, 2)}
      </pre>
    </div>
  );
};

export type SearchToolHeaderProps = {
  state: ToolUIPart["state"];
  input: ToolUIPart["input"];
  output?: unknown;
  providerExecuted?: boolean;
  className?: string;
};

type SearchAction = { runningVerb: string; doneVerb: string; target: string };

function asObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function firstString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim().length > 0) return value;
  }
  return undefined;
}

// Different providers expose the search query in different places:
// - Anthropic / Google: input.query
// - OpenAI: output.action.{query,url,pattern}
// - xAI (web_search, x_search): output.query (top-level)
function extractSearchAction(
  input: ToolUIPart["input"],
  output: unknown
): SearchAction | undefined {
  const outputObj = asObject(output);
  const action = asObject(outputObj?.action);

  if (action?.type === "openPage") {
    const url = typeof action.url === "string" ? action.url : undefined;
    if (url) return { runningVerb: "Opening", doneVerb: "Opened", target: url };
  }
  if (action?.type === "findInPage") {
    const pattern = typeof action.pattern === "string" ? action.pattern : undefined;
    if (pattern) {
      return {
        runningVerb: "Searching in page for",
        doneVerb: "Searched in page for",
        target: `"${pattern}"`,
      };
    }
  }

  const query =
    (action?.type === "search" && typeof action.query === "string"
      ? action.query
      : undefined) ??
    firstString(outputObj ?? {}, ["query", "q", "search_query", "searchQuery"]) ??
    firstString(asObject(input) ?? {}, ["query", "q", "search_query", "searchQuery"]);

  if (query) {
    return {
      runningVerb: "Searching the web for",
      doneVerb: "Searched the web for",
      target: `"${query}"`,
    };
  }

  const queries = asObject(input)?.queries ?? outputObj?.queries;
  if (Array.isArray(queries)) {
    const joined = queries.filter((q): q is string => typeof q === "string").join(", ");
    if (joined.length > 0) {
      return {
        runningVerb: "Searching the web for",
        doneVerb: "Searched the web for",
        target: `"${joined}"`,
      };
    }
  }

  return undefined;
}

export const SearchToolHeader = memo(
  ({ className, state, input, output, providerExecuted }: SearchToolHeaderProps) => {
    const { isOpen } = useTool();
    const action = extractSearchAction(input, output);
    // xAI's web_search / x_search are provider-executed and never emit a
    // tool-result, so state stays at `input-available` forever. Treat that
    // terminal state as "done" for any provider-executed tool.
    const hasOutput = output !== undefined && output !== null;
    const stuckProviderTool = providerExecuted && state === "input-available";
    const isRunning = !hasOutput && !stuckProviderTool && state !== "output-available";

    return (
      <CollapsibleTrigger
        className={cn(
          "group/tool flex items-center gap-2 text-muted-foreground text-sm",
          className
        )}
      >
        {isRunning ? (
          <p className="animate-pulse text-primary drop-shadow-[0_0_3px_var(--ring)]">
            <ShiningText>
              {action
                ? `${action.runningVerb} ${action.target}...`
                : "Searching the web..."}
            </ShiningText>
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <GlobeIcon size={16} />
            <p>{action ? `${action.doneVerb} ${action.target}` : "Searched the web"}</p>
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
