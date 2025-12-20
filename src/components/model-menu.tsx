"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Check, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { memo, use, useEffect } from "react";
import { KeyHandler } from "@/components/key-handler";
import { TemporaryChatSwitch } from "@/components/temporary-chat-switch";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStableId } from "@/hooks/use-stable-id";
import { useTranslations } from "@/lib/contexts/translations-context";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { featureIcons, getProviderIcon, providerIcons } from "@/lib/providers";
import { useUpdateConversationModel } from "@/lib/queries/conversations";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import { useUIStore } from "@/stores/ui-store";
import type { Feature, PublicModel, PublicProvider } from "@/types/provider";
import type { Status } from "@/types/status";

function ModelMenu() {
  const pathname = usePathname();
  const setModelMenuOpen = useUIStore((state) => state.setModelMenuOpen);
  const modelMenuOpen = useUIStore((state) => state.modelMenuOpen);
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
  }, [pathname, defaultModel, isLoading, setDefaultModel]);

  if (isDesktop) {
    return (
      <>
        <KeyHandler keyString="m" handler={() => setModelMenuOpen(true)} />
        <Popover open={modelMenuOpen} onOpenChange={setModelMenuOpen}>
          <PopoverTrigger asChild className="hidden md:flex">
            <Button
              variant="ghost"
              size="sm"
              className="items-center gap-2 rounded-2xl border md:flex"
              disabled={!model}
            >
              {model?.name ? (
                <span>{model?.name}</span>
              ) : (
                <div className="flex items-center justify-center space-x-1">
                  <div className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]"></div>
                  <div className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]"></div>
                  <div className="size-1 animate-bounce rounded-full bg-muted-foreground"></div>
                </div>
              )}
              <ChevronDown
                size={16}
                className={cn(
                  "transition-transform duration-200 ease-out",
                  modelMenuOpen && "rotate-180"
                )}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <StatusList providers={providers} status={status} />
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
            <StatusList providers={providers} status={status} />
            <Separator />
            <TemporaryChatSwitch />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function StatusList({
  providers,
  status,
}: Readonly<{
  providers: PublicProvider[];
  status?: Status;
}>) {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const stableId = useStableId();

  const setOpen = useUIStore((state) => state.setModelMenuOpen);
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
    <TooltipProvider delayDuration={0}>
      <Command
        className="rounded-none md:rounded-md"
        defaultValue={selectedModel?.name || ""}
      >
        <CommandInput
          placeholder={translations.input.modelMenu.placeholder.replace(
            "{number}",
            modelCount.toString()
          )}
        />
        <CommandList className="max-h-[min(300px,calc(50vh-5rem))] transition-all duration-150 ease-out">
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertCircle
                          size={18}
                          className="mr-0.5 ml-auto text-destructive"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Warning: Some models from {provider.name} might be down.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              }
              className="transition-all duration-150 ease-out"
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
                    "group relative flex justify-between border transition-all duration-150 ease-out",
                    "border-none pl-6",
                    model.id === selectedModel?.id
                      ? "border-primary"
                      : "border-transparent"
                  )}
                >
                  <span className="text-center">{model.name}</span>
                  {model.id === selectedModel?.id && <Check className="mr-auto size-4" />}
                  <div className="flex gap-0.5">
                    {model.features?.map((feature: Feature) => (
                      <Tooltip key={feature.name} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <span className="rounded-full p-1">
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
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{feature.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </TooltipProvider>
  );
}

export default memo(ModelMenu);
