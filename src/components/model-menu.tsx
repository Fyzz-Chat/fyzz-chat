"use client";

import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { featureIcons, providerIcons } from "@/lib/providers";
import { getProviderIcon } from "@/lib/providers";
import { useUpdateConversationModel } from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import { useModelStore } from "@/stores/model-store";
import type { Translations } from "@/types/locale";
import type { Feature, PublicModel, PublicProvider } from "@/types/provider";
import { ChevronDown } from "lucide-react";
import { memo, use, useState } from "react";
import React from "react";
import { HoverPopover } from "./hover-popover";
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

function ModelMenu({
  translationsPromise,
}: { translationsPromise: Promise<Translations> }) {
  const [open, setOpen] = useState(false);
  const model = useModelStore((state) => state.model);
  const providers = useModelStore((state) => state.providers);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const providerIcon = getProviderIcon(providers, model?.id);

  if (isDesktop) {
    return (
      <>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild className="hidden md:flex">
            <Button
              variant="secondary"
              size="sm"
              className="md:flex items-center gap-2"
              disabled={!model}
            >
              <span>{model?.name || "Set an API key first"}</span>
              <ChevronDown size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <StatusList
              setOpen={setOpen}
              providers={providers}
              translationsPromise={translationsPromise}
            />
            <Separator />
            <TemporaryChatSwitch translationsPromise={translationsPromise} />
          </PopoverContent>
        </Popover>
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
            <StatusList
              setOpen={setOpen}
              providers={providers}
              translationsPromise={translationsPromise}
            />
            <Separator />
            <TemporaryChatSwitch translationsPromise={translationsPromise} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function StatusList({
  setOpen,
  providers,
  translationsPromise,
}: {
  setOpen: (open: boolean) => void;
  providers: PublicProvider[];
  translationsPromise: Promise<Translations>;
}) {
  const translations = use(translationsPromise);
  const stableId = useChatStore((state) => state.stableId);

  const model = useModelStore((state) => state.model);
  const setModel = useModelStore((state) => state.setModel);
  const updateModel = useUpdateConversationModel();

  const handleModelChange = (value: string) => {
    setModel(value);

    if (stableId) {
      updateModel.mutateAsync({ conversationId: stableId, model: value });
    }
  };

  const modelCount = providers.flatMap((provider) => provider.models).length;

  return (
    <Command className="rounded-none md:rounded-md" defaultValue={model?.name || ""}>
      <CommandInput
        placeholder={translations.input.modelMenu.placeholder.replace(
          "{number}",
          modelCount.toString()
        )}
      />
      <CommandList>
        <CommandEmpty>{translations.input.modelMenu.noResults}</CommandEmpty>
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

export default memo(ModelMenu);
