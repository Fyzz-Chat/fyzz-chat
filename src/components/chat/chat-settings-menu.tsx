"use client";

import { BrainIcon, CheckIcon, GlobeIcon, PaperclipIcon, PlusIcon } from "lucide-react";
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
import { useChatInput } from "@/lib/contexts/chat-input-context";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { ReasoningEffort } from "@/types/provider";

const REASONING_EFFORTS: ReasoningEffort[] = ["low", "medium", "high"];

function ReasoningBars({
  className,
  effort,
}: Readonly<{ className?: string; effort: ReasoningEffort }>) {
  const activeBars = effort === "high" ? 3 : effort === "medium" ? 2 : 1;

  return (
    <div className={cn("flex items-end gap-1", className)}>
      {[0, 1, 2].map((index) => (
        <span
          className={cn(
            "w-1.5 rounded-xs bg-muted-foreground/30",
            index === 0 && "h-2",
            index === 1 && "h-3",
            index === 2 && "h-4",
            index < activeBars && "bg-(--theme-blue)"
          )}
          key={index}
        />
      ))}
    </div>
  );
}

export default function ChatSettingsMenu({
  supportsAttachments,
  supportsReasoning,
}: Readonly<{
  supportsAttachments: boolean;
  supportsReasoning: boolean;
}>) {
  const attachments = usePromptInputAttachments();
  const { browseRef, reasoningEffortRef } = useChatInput();
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [browse, setBrowse] = useState(browseRef.current);
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort>(
    reasoningEffortRef.current || "low"
  );

  useEffect(() => {
    setRendered(true);
  }, []);

  useEffect(() => {
    browseRef.current = browse;
  }, [browse, browseRef]);

  useEffect(() => {
    reasoningEffortRef.current = supportsReasoning ? reasoningEffort : undefined;
  }, [reasoningEffort, supportsReasoning, reasoningEffortRef]);

  const handleAttachClick = useCallback(() => {
    attachments.openFileDialog();
    setOpen(false);
  }, [attachments]);

  const cycleReasoningEffort = useCallback(() => {
    const currentIndex = REASONING_EFFORTS.indexOf(reasoningEffort);
    const nextIndex = currentIndex >= REASONING_EFFORTS.length - 1 ? 0 : currentIndex + 1;
    setReasoningEffort(REASONING_EFFORTS[nextIndex] || "low");
  }, [reasoningEffort]);

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
        onClick={() => setBrowse(!browse)}
        type="button"
        variant="ghost"
      >
        <GlobeIcon className="size-4" />
        <span>Web search</span>
        <div className="ml-auto size-4">
          {browse ? <CheckIcon className="size-4" /> : <span className="size-4" />}
        </div>
      </Button>

      {supportsReasoning ? (
        <Button
          className="w-full justify-between rounded-[8px]"
          onClick={cycleReasoningEffort}
          type="button"
          variant="ghost"
        >
          <BrainIcon className="size-4" />
          <span className="capitalize">Reasoning: {reasoningEffort}</span>
          <ReasoningBars className="ml-auto" effort={reasoningEffort} />
        </Button>
      ) : null}
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
