"use client";

import { useChatContext } from "@/lib/contexts/chat-context";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { featureIcons, providerIcons } from "@/lib/providers";
import { getProviderIcon } from "@/lib/providers";
import { useUpdateConversationModel } from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import type { Feature, PublicModel, PublicProvider } from "@/types/provider";
import { ChevronDown, MessageCircleDashed } from "lucide-react";
import { useState } from "react";
import React from "react";
import { HoverPopover } from "./hover-popover";
import TemporaryChatIcon from "./temporary-chat-icon";
import { TemporaryChatSwitch } from "./temporary-chat-switch";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";

export function ModelMenu() {
  const [open, setOpen] = useState(false);
  const { model, providers } = useModelStore();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const providerIcon = getProviderIcon(providers, model.id);

  if (isDesktop) {
    return (
      <>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild className="hidden md:block">
            <Button variant="secondary" size="sm" className="md:flex items-center gap-2">
              <span>{model.name}</span>
              <ChevronDown size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <StatusList setOpen={setOpen} providers={providers} />
            <Separator />
            <TemporaryChatSwitch />
          </PopoverContent>
        </Popover>
        <TemporaryChatIcon className="-mb-4" />
      </>
    );
  }

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon" className="size-9">
            {providerIcon &&
              React.createElement(
                providerIcons[providerIcon as keyof typeof providerIcons],
                { size: 16 }
              )}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="sr-only">
            <DrawerTitle>Select a model</DrawerTitle>
            <DrawerDescription>
              Choose a model to use for your conversation.
            </DrawerDescription>
          </DrawerHeader>
          <div className="mt-4 border-t">
            <StatusList setOpen={setOpen} providers={providers} />
            <Separator />
            <TemporaryChatSwitch />
          </div>
        </DrawerContent>
      </Drawer>
      <TemporaryChatIcon className="size-7" />
    </>
  );
}

function StatusList({
  setOpen,
  providers,
}: {
  setOpen: (open: boolean) => void;
  providers: PublicProvider[];
}) {
  const { stableId } = useChatContext();

  const { model, setModel } = useModelStore();
  const updateModel = useUpdateConversationModel();

  const handleModelChange = (value: string) => {
    setModel(value);

    if (stableId) {
      updateModel.mutateAsync({ conversationId: stableId, model: value });
    }
  };

  const modelCount = providers.flatMap((provider) => provider.models).length;

  return (
    <Command className="rounded-none md:rounded-md" defaultValue={model.name}>
      <CommandInput placeholder={`Filter ${modelCount} models...`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {providers.map((provider) => (
          <CommandGroup
            key={`${provider.id}-${provider.name}`}
            heading={
              <div className="flex items-center gap-2">
                {React.createElement(
                  providerIcons[provider.icon as keyof typeof providerIcons],
                  { size: 16 }
                )}
                {provider.name}
              </div>
            }
          >
            {provider.models.map((model: PublicModel) => (
              <CommandItem
                key={model.name}
                value={model.name}
                onSelect={() => {
                  handleModelChange(model.id);
                  setOpen(false);
                }}
                className="group flex justify-between pl-6"
              >
                <span className="mr-auto">{model.name}</span>
                {model.features?.map((feature: Feature) => (
                  <HoverPopover key={feature.name} content={feature.description}>
                    <div
                      className="rounded-full p-1"
                      onClick={(e) => e.stopPropagation()} // Prevent triggering the CommandItem's onSelect
                    >
                      {React.createElement(
                        featureIcons[feature.icon as keyof typeof featureIcons],
                        {
                          size: 16,
                          className: cn(
                            feature.color,
                            "group-data-[selected='true']:text-accent-foreground"
                          ),
                        }
                      )}
                    </div>
                  </HoverPopover>
                ))}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
}
