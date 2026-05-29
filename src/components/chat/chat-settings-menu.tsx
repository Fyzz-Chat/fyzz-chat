"use client";

import {
  BrainIcon,
  CheckIcon,
  GlobeIcon,
  MicroscopeIcon,
  PaperclipIcon,
  PlusIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  PromptInputButton,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useChatInput, useChatInputStatus } from "@/lib/contexts/chat-input-context";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { ReasoningEffort } from "@/types/provider";

function defaultEffort(levels: readonly ReasoningEffort[]): ReasoningEffort {
  if (levels.includes("medium")) {
    return "medium";
  }
  return levels[Math.floor(levels.length / 2)] ?? "medium";
}

function ReasoningBars({
  className,
  levels,
  effort,
}: Readonly<{
  className?: string;
  levels: readonly ReasoningEffort[];
  effort: ReasoningEffort;
}>) {
  const activeBars = levels.indexOf(effort) + 1;
  const count = levels.length;

  return (
    <div className={cn("flex items-end gap-1", className)}>
      {levels.map((level, index) => (
        <span
          className={cn(
            "w-1.5 rounded-xs bg-muted-foreground/30",
            index < activeBars && "bg-(--theme-blue)"
          )}
          key={level}
          style={{ height: `${8 + index * (8 / Math.max(count - 1, 1))}px` }}
        />
      ))}
    </div>
  );
}

export default function ChatSettingsMenu({
  supportsAttachments,
  supportsReasoning,
  effortLevels,
}: Readonly<{
  supportsAttachments: boolean;
  supportsReasoning: boolean;
  effortLevels?: readonly ReasoningEffort[];
}>) {
  const attachments = usePromptInputAttachments();
  const { browseRef, reasoningEffortRef, setDeepResearch } = useChatInput();
  const { deepResearch, hasPendingResearch } = useChatInputStatus();
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [browse, setBrowse] = useState(browseRef.current);
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort | undefined>(
    reasoningEffortRef.current
  );

  useEffect(() => {
    setRendered(true);
  }, []);

  useEffect(() => {
    browseRef.current = browse;
  }, [browse, browseRef]);

  useEffect(() => {
    if ((deepResearch || hasPendingResearch) && !browse) {
      setBrowse(true);
    }
  }, [deepResearch, hasPendingResearch, browse]);

  useEffect(() => {
    if (!effortLevels?.length) {
      return;
    }
    setReasoningEffort((current) =>
      current && effortLevels.includes(current) ? current : defaultEffort(effortLevels)
    );
  }, [effortLevels]);

  useEffect(() => {
    reasoningEffortRef.current = supportsReasoning ? reasoningEffort : undefined;
  }, [reasoningEffort, supportsReasoning, reasoningEffortRef]);

  const handleAttachClick = useCallback(() => {
    attachments.openFileDialog();
    setOpen(false);
  }, [attachments]);

  const cycleReasoningEffort = useCallback(() => {
    if (!effortLevels?.length) {
      return;
    }
    setReasoningEffort((current) => {
      const currentIndex = current ? effortLevels.indexOf(current) : -1;
      const nextIndex = currentIndex >= effortLevels.length - 1 ? 0 : currentIndex + 1;
      return effortLevels[nextIndex];
    });
  }, [effortLevels]);

  const menuContent = (
    <div className="flex flex-col gap-1">
      <div className="flex justify-center">
        <Button
          className="h-20 flex-1 flex-col justify-center rounded-[8px] border sm:h-auto sm:flex-row sm:justify-start sm:border-none"
          disabled={!supportsAttachments}
          onClick={handleAttachClick}
          type="button"
          variant="ghost"
        >
          <PaperclipIcon className="size-4" />
          Attach files
        </Button>
      </div>

      <Separator className="my-1" />

      <Button
        className={cn(
          "w-full justify-between rounded-[8px]",
          browse &&
            "text-(--theme-blue) hover:bg-(--theme-blue)/10 hover:text-(--theme-blue) dark:hover:bg-(--theme-blue)/10"
        )}
        disabled={deepResearch || hasPendingResearch}
        onClick={() => setBrowse(!browse)}
        type="button"
        variant="ghost"
        title={
          deepResearch || hasPendingResearch
            ? "Deep research has its own web search"
            : undefined
        }
      >
        <GlobeIcon className="size-4" />
        <span>Web search</span>
        <div className="ml-auto size-4">
          {browse ? <CheckIcon className="size-4" /> : <span className="size-4" />}
        </div>
      </Button>

      <Button
        className={cn(
          "w-full justify-between rounded-[8px]",
          deepResearch &&
            "text-(--theme-blue) hover:bg-(--theme-blue)/10 hover:text-(--theme-blue) dark:hover:bg-(--theme-blue)/10"
        )}
        disabled={hasPendingResearch}
        onClick={() => setDeepResearch(!deepResearch)}
        type="button"
        variant="ghost"
        title={
          hasPendingResearch
            ? "A research is already running in this conversation"
            : undefined
        }
      >
        <MicroscopeIcon className="size-4" />
        <span>Deep research (o4-mini)</span>
        <div className="ml-auto size-4">
          {deepResearch ? <CheckIcon className="size-4" /> : <span className="size-4" />}
        </div>
      </Button>

      {supportsReasoning && effortLevels?.length
        ? (() => {
            const displayEffort =
              reasoningEffort && effortLevels.includes(reasoningEffort)
                ? reasoningEffort
                : defaultEffort(effortLevels);
            return (
              <Button
                className="w-full justify-between rounded-[8px]"
                onClick={cycleReasoningEffort}
                type="button"
                variant="ghost"
              >
                <BrainIcon className="size-4" />
                <span className="capitalize">Reasoning: {displayEffort}</span>
                <ReasoningBars
                  className="ml-auto"
                  effort={displayEffort}
                  levels={effortLevels}
                />
              </Button>
            );
          })()
        : null}
    </div>
  );

  if (!rendered) {
    return null;
  }

  if (isDesktop) {
    return (
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <PromptInputButton className="rounded-full">
            <PlusIcon className="size-4" />
          </PromptInputButton>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-2">
          {menuContent}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <PromptInputButton className="rounded-full">
          <PlusIcon className="size-4" />
        </PromptInputButton>
      </DrawerTrigger>
      <DrawerContent className="space-y-1 px-4 pb-6">
        <DrawerHeader>
          <DrawerTitle>Chat settings</DrawerTitle>
          <DrawerDescription className="sr-only">
            Manage tools and attachments.
          </DrawerDescription>
        </DrawerHeader>
        {menuContent}
      </DrawerContent>
    </Drawer>
  );
}
