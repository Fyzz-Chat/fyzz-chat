"use client";

import { CheckIcon, GlobeIcon, PaperclipIcon, PlusIcon } from "lucide-react";
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

export default function ChatSettingsMenu({
  supportsAttachments,
}: Readonly<{
  supportsAttachments: boolean;
}>) {
  const attachments = usePromptInputAttachments();
  const { browseRef } = useChatInput();
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [browse, setBrowse] = useState(browseRef.current);

  useEffect(() => {
    setRendered(true);
  }, []);

  useEffect(() => {
    browseRef.current = browse;
  }, [browse, browseRef]);

  const handleAttachClick = useCallback(() => {
    attachments.openFileDialog();
    setOpen(false);
  }, [attachments]);

  const menuContent = (
    <div className="flex flex-col gap-1">
      <div className="flex justify-center">
        <Button
          className="h-20 flex-col justify-center rounded-[8px] border sm:h-auto sm:w-full sm:flex-row sm:justify-start sm:border-none"
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
            "text-[#3B82F6] hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] dark:hover:bg-[#3B82F6]/10"
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
