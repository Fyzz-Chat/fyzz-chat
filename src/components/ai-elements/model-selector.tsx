"use client";

import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

const ModelSelectorContext = createContext<{ isDesktop: boolean }>({ isDesktop: true });

export type ModelSelectorProps = ComponentProps<typeof Dialog>;

export const ModelSelector = ({ children, ...props }: ModelSelectorProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const contextValue = useMemo(() => ({ isDesktop }), [isDesktop]);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    setRendered(true);
  }, []);

  if (!rendered) {
    return null;
  }

  return (
    <ModelSelectorContext.Provider value={contextValue}>
      {isDesktop ? (
        <Dialog {...props}>{children}</Dialog>
      ) : (
        <Drawer {...props}>{children}</Drawer>
      )}
    </ModelSelectorContext.Provider>
  );
};

export type ModelSelectorTriggerProps = ComponentProps<typeof DialogTrigger>;

export const ModelSelectorTrigger = (props: ModelSelectorTriggerProps) => {
  const { isDesktop } = useContext(ModelSelectorContext);
  return isDesktop ? <DialogTrigger {...props} /> : <DrawerTrigger {...props} />;
};

export type ModelSelectorContentProps = ComponentProps<typeof DialogContent> & {
  title?: ReactNode;
  description?: string;
};

export const ModelSelectorContent = ({
  className,
  children,
  title = "Model Selector",
  description = "Select a model to use for your conversation.",
  ...props
}: ModelSelectorContentProps) => {
  const { isDesktop } = useContext(ModelSelectorContext);

  if (isDesktop) {
    return (
      <DialogContent
        className={cn(
          "outline! border-none! p-0 outline-border! outline-solid!",
          className
        )}
        {...props}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command className="**:data-[slot=command-input-wrapper]:h-auto">
          {children}
        </Command>
      </DialogContent>
    );
  }

  return (
    <DrawerContent className={className} {...props}>
      <DrawerHeader className="sr-only">
        <DrawerTitle>{title}</DrawerTitle>
        <DrawerDescription>{description}</DrawerDescription>
      </DrawerHeader>
      <Command className="mt-4 rounded-b-none border-t **:data-[slot=command-input-wrapper]:h-auto">
        {children}
      </Command>
    </DrawerContent>
  );
};

export type ModelSelectorDialogProps = ComponentProps<typeof CommandDialog>;

export const ModelSelectorDialog = (props: ModelSelectorDialogProps) => (
  <CommandDialog {...props} />
);

export type ModelSelectorInputProps = ComponentProps<typeof CommandInput>;

export const ModelSelectorInput = ({ className, ...props }: ModelSelectorInputProps) => (
  <CommandInput className={cn("h-auto py-3.5", className)} {...props} />
);

export type ModelSelectorListProps = ComponentProps<typeof CommandList>;

export const ModelSelectorList = (props: ModelSelectorListProps) => (
  <CommandList {...props} />
);

export type ModelSelectorEmptyProps = ComponentProps<typeof CommandEmpty>;

export const ModelSelectorEmpty = (props: ModelSelectorEmptyProps) => (
  <CommandEmpty {...props} />
);

export type ModelSelectorGroupProps = ComponentProps<typeof CommandGroup>;

export const ModelSelectorGroup = (props: ModelSelectorGroupProps) => (
  <CommandGroup {...props} />
);

export type ModelSelectorItemProps = ComponentProps<typeof CommandItem>;

export const ModelSelectorItem = (props: ModelSelectorItemProps) => (
  <CommandItem {...props} />
);

export type ModelSelectorShortcutProps = ComponentProps<typeof CommandShortcut>;

export const ModelSelectorShortcut = (props: ModelSelectorShortcutProps) => (
  <CommandShortcut {...props} />
);

export type ModelSelectorSeparatorProps = ComponentProps<typeof CommandSeparator>;

export const ModelSelectorSeparator = (props: ModelSelectorSeparatorProps) => (
  <CommandSeparator {...props} />
);

export type ModelSelectorLogoProps = Omit<ComponentProps<"img">, "src" | "alt"> & {
  provider:
    | "moonshotai-cn"
    | "lucidquery"
    | "moonshotai"
    | "zai-coding-plan"
    | "alibaba"
    | "xai"
    | "vultr"
    | "nvidia"
    | "upstage"
    | "groq"
    | "github-copilot"
    | "mistral"
    | "vercel"
    | "nebius"
    | "deepseek"
    | "alibaba-cn"
    | "google-vertex-anthropic"
    | "venice"
    | "chutes"
    | "cortecs"
    | "github-models"
    | "togetherai"
    | "azure"
    | "baseten"
    | "huggingface"
    | "opencode"
    | "fastrouter"
    | "google"
    | "google-vertex"
    | "cloudflare-workers-ai"
    | "inception"
    | "wandb"
    | "openai"
    | "zhipuai-coding-plan"
    | "perplexity"
    | "openrouter"
    | "zenmux"
    | "v0"
    | "iflowcn"
    | "synthetic"
    | "deepinfra"
    | "zhipuai"
    | "submodel"
    | "zai"
    | "inference"
    | "requesty"
    | "morph"
    | "lmstudio"
    | "anthropic"
    | "aihubmix"
    | "fireworks-ai"
    | "modelscope"
    | "llama"
    | "scaleway"
    | "amazon-bedrock"
    | "cerebras"
    | string;
};

export const ModelSelectorLogo = ({
  provider,
  className,
  ...props
}: ModelSelectorLogoProps) => (
  <img
    {...props}
    alt={`${provider} logo`}
    className={cn("size-3 dark:invert", className)}
    height={12}
    // Take logos from https://models.dev/logos/${provider}.svg
    src={`/logos/${provider}.svg`}
    width={12}
  />
);

export type ModelSelectorLogoGroupProps = ComponentProps<"div">;

export const ModelSelectorLogoGroup = ({
  className,
  ...props
}: ModelSelectorLogoGroupProps) => (
  <div
    className={cn(
      "flex shrink-0 items-center -space-x-1 [&>img]:rounded-full [&>img]:bg-background [&>img]:p-px [&>img]:ring-1 dark:[&>img]:bg-foreground",
      className
    )}
    {...props}
  />
);

export type ModelSelectorNameProps = ComponentProps<"span">;

export const ModelSelectorName = ({ className, ...props }: ModelSelectorNameProps) => (
  <span className={cn("flex-1 truncate text-left", className)} {...props} />
);
