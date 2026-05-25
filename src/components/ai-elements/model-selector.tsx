"use client";

import { Brain, CodeXml, Globe, ImageIcon } from "lucide-react";
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

const COST_TIERS: Record<number, { label: string; className: string }> = {
  1: { label: "Budget", className: "text-muted-foreground" },
  2: { label: "Economy", className: "text-green-500" },
  3: { label: "Standard", className: "text-blue-500" },
  4: { label: "Plus", className: "text-amber-500" },
  5: { label: "Premium", className: "text-orange-500" },
  6: { label: "Flagship", className: "text-red-500" },
  7: { label: "Ultra", className: "text-purple-500" },
};

const ModelSelectorContext = createContext<{ isDesktop: boolean }>({ isDesktop: true });

type DialogRootProps = ComponentProps<typeof Dialog>;
type DrawerRootProps = ComponentProps<typeof Drawer>;
type DialogTriggerProps = ComponentProps<typeof DialogTrigger>;
type DrawerTriggerProps = ComponentProps<typeof DrawerTrigger>;
type DialogContentProps = ComponentProps<typeof DialogContent>;
type DrawerContentProps = ComponentProps<typeof DrawerContent>;

export type ModelSelectorProps = DialogRootProps & DrawerRootProps;

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
        <Dialog {...(props as DialogRootProps)}>{children}</Dialog>
      ) : (
        <Drawer {...(props as DrawerRootProps)}>{children}</Drawer>
      )}
    </ModelSelectorContext.Provider>
  );
};

export type ModelSelectorTriggerProps = DialogTriggerProps & DrawerTriggerProps;

export const ModelSelectorTrigger = (props: ModelSelectorTriggerProps) => {
  const { isDesktop } = useContext(ModelSelectorContext);
  return isDesktop ? (
    <DialogTrigger {...(props as DialogTriggerProps)} />
  ) : (
    <DrawerTrigger {...(props as DrawerTriggerProps)} />
  );
};

export type ModelSelectorContentProps = (DialogContentProps & DrawerContentProps) & {
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
        {...(props as DialogContentProps)}
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
    <DrawerContent className={className} {...(props as DrawerContentProps)}>
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

const FALLBACK_LOGO = "/logos/other.svg";

export const ModelSelectorLogo = ({
  provider,
  className,
  ...props
}: ModelSelectorLogoProps) => {
  // Take logos from https://models.dev/logos/${provider}.svg
  const [src, setSrc] = useState(`/logos/${provider}.svg`);

  useEffect(() => {
    setSrc(`/logos/${provider}.svg`);
  }, [provider]);

  return (
    <img
      {...props}
      alt={`${provider} logo`}
      className={cn("size-4 dark:invert", className)}
      height={12}
      onError={() => setSrc(FALLBACK_LOGO)}
      src={src}
      width={12}
    />
  );
};

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

const FEATURE_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  brain: { icon: Brain, color: "text-yellow-500" },
  globe: { icon: Globe, color: "text-blue-500" },
  codeXml: { icon: CodeXml, color: "text-green-500" },
  image: { icon: ImageIcon, color: "text-orange-500" },
};

export type ModelSelectorFeaturesProps = ComponentProps<"div"> & {
  features?: { icon: string; color?: string }[];
};

export const ModelSelectorFeatures = ({
  features,
  className,
  ...props
}: ModelSelectorFeaturesProps) => {
  if (!features?.length) return null;

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {features.map((feature) => {
        const mapped = FEATURE_ICONS[feature.icon];
        if (!mapped) return null;
        const Icon = mapped.icon;
        return (
          <Icon
            key={feature.icon}
            className={cn("size-3.5", feature.color || mapped.color)}
          />
        );
      })}
    </div>
  );
};

function CostDots({ cost, max, color }: { cost: number; max: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((dot) => (
        <span
          key={dot}
          className={cn("text-[8px]", dot <= cost ? color : "text-muted-foreground/30")}
        >
          ●
        </span>
      ))}
    </div>
  );
}

export type ModelSelectorCostProps = { cost: number; maxCost: number };

export const ModelSelectorCost = ({ cost, maxCost }: ModelSelectorCostProps) => {
  const tier = COST_TIERS[cost] ?? { label: "Ultra", className: "text-purple-500" };
  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>
        <span className={cn("font-mono text-xs", tier.className)}>{cost}x</span>
      </HoverCardTrigger>
      <HoverCardContent className="flex w-auto flex-col gap-1 p-3">
        <span className="font-semibold text-xs">{tier.label}</span>
        <span className="text-muted-foreground text-xs">
          ~{cost}x the cost of the most affordable model
        </span>
        <CostDots cost={cost} max={maxCost} color={tier.className} />
      </HoverCardContent>
    </HoverCard>
  );
};
