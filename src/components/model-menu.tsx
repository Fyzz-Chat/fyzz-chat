"use client";

import { HoverPopover } from "@/components/hover-popover";
import { KeyHandler } from "@/components/key-handler";
import { TemporaryChatSwitch } from "@/components/temporary-chat-switch";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/contexts/translations-context";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { featureIcons, getProviderIcon, providerIcons } from "@/lib/providers";
import { useUpdateConversationModel } from "@/lib/queries/conversations";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import { useModelMenuStore } from "@/stores/model-menu-store";
import { useModelStore } from "@/stores/model-store";
import type { Feature, PublicModel, PublicProvider } from "@/types/provider";
import type { Status } from "@/types/status";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Check, ChevronDown, Maximize2, Minimize2 } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { memo, use, useEffect, useState } from "react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

function ModelMenu() {
  const pathname = usePathname();
  const setModelMenuOpen = useModelMenuStore((state) => state.setModelMenuOpen);
  const modelMenuOpen = useModelMenuStore((state) => state.modelMenuOpen);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const trpc = useTRPC();
  const { data: defaultModel, isLoading } = useQuery(
    trpc.defaultModel.queryOptions(undefined, {
      staleTime: 0,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    })
  );
  const { data: status } = useQuery(
    trpc.status.queryOptions(undefined, {
      staleTime: 0,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    })
  );
  const model = useModelStore((state) => state.model);
  const setDefaultModel = useModelStore((state) => state.setDefaultModel);
  const providers = useModelStore((state) => state.providers);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const providerIcon = getProviderIcon(providers, model?.id);

  useEffect(() => {
    if (pathname === "/chat" && !isLoading) {
      setDefaultModel(defaultModel || undefined);
    }
  }, [pathname, defaultModel, isLoading]);

  useEffect(() => {
    if (!modelMenuOpen) {
      setIsEnlarged(false);
    }
  }, [modelMenuOpen]);

  if (isDesktop) {
    return (
      <>
        <KeyHandler keyString="m" handler={() => setModelMenuOpen(true)} />
        <Popover open={modelMenuOpen} onOpenChange={setModelMenuOpen}>
          <PopoverTrigger asChild className="hidden md:flex">
            <Button
              variant="secondary"
              size="sm"
              className="md:flex items-center gap-2"
              disabled={!model}
            >
              {model?.name ? (
                <span>{model?.name}</span>
              ) : (
                <div className="flex space-x-1 justify-center items-center">
                  <div className="size-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="size-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="size-1 bg-muted-foreground rounded-full animate-bounce"></div>
                </div>
              )}
              <ChevronDown size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className={cn(
              "p-0 transition-all duration-300 ease-out",
              isEnlarged ? "w-[500px]" : "w-[300px]"
            )}
            align="start"
          >
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 z-10 size-7"
                onClick={() => setIsEnlarged(!isEnlarged)}
              >
                {isEnlarged ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </Button>
              <div className="transition-all duration-300 ease-out overflow-hidden">
                <StatusList
                  setOpen={setModelMenuOpen}
                  providers={providers}
                  isEnlarged={isEnlarged}
                  status={status}
                />
              </div>
            </div>
            <Separator />
            <TemporaryChatSwitch />
          </PopoverContent>
        </Popover>
      </>
    );
  }

  return (
    <>
      <KeyHandler keyString="m" handler={() => setModelMenuOpen(true)} />
      <Drawer open={modelMenuOpen} onOpenChange={setModelMenuOpen}>
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
              setOpen={setModelMenuOpen}
              providers={providers}
              status={status}
            />
            <Separator />
            <TemporaryChatSwitch />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function StatusList({
  setOpen,
  providers,
  isEnlarged = false,
  status,
}: {
  setOpen: (open: boolean) => void;
  providers: PublicProvider[];
  isEnlarged?: boolean;
  status?: Status;
}) {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const stableId = useChatStore((state) => state.stableId);

  const selectedModel = useModelStore((state) => state.model);
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
    <Command
      className="rounded-none md:rounded-md"
      defaultValue={selectedModel?.name || ""}
    >
      <CommandInput
        placeholder={translations.input.modelMenu.placeholder.replace(
          "{number}",
          modelCount.toString()
        )}
        className={isEnlarged ? "pr-10" : ""}
      />
      <CommandList
        className={cn(
          "transition-all duration-300 ease-out",
          isEnlarged
            ? "max-h-[min(600px,calc(100vh-12rem))]"
            : "max-h-[min(400px,calc(100vh-12rem))]"
        )}
      >
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
                {!status?.providers?.[provider.id] && (
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <AlertCircle
                          size={18}
                          className="ml-auto mr-0.5 text-destructive"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Warning: Some models from {provider.name} might be down.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            }
            className={cn(
              "transition-all duration-300 ease-out",
              isEnlarged &&
                "**:[[cmdk-group-items]]:grid **:[[cmdk-group-items]]:grid-cols-3 **:[[cmdk-group-items]]:gap-2 p-2"
            )}
          >
            {provider.models.map((model: PublicModel) => (
              <CommandItem
                key={model.name}
                value={model.name}
                onSelect={() => {
                  handleModelChange(model.id);
                  setOpen(false);
                }}
                className={cn(
                  "group relative flex justify-between transition-all duration-300 ease-out border",
                  isEnlarged
                    ? "py-3 px-3 flex-col items-center gap-1 h-[160px] border-border"
                    : "pl-6 border-none",
                  model.id === selectedModel?.id ? "border-primary" : "border-transparent"
                )}
              >
                {model.id === selectedModel?.id && (
                  <Check
                    className={cn(
                      "absolute size-4 text-primary",
                      isEnlarged ? "top-2 right-2" : "left-0"
                    )}
                  />
                )}
                <span className="text-center">{model.name}</span>
                <div
                  className={cn(
                    "hidden",
                    isEnlarged && "grid place-items-center size-full"
                  )}
                >
                  {React.createElement(
                    providerIcons[provider.icon as keyof typeof providerIcons],
                    { size: 48 }
                  )}
                </div>
                <div className="flex gap-0.5">
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
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
}

export default memo(ModelMenu);
