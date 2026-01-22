"use client";

import { ImageIcon, type LucideIcon, MessageSquare, Sparkles, Zap } from "lucide-react";
import { useContext } from "react";
import {
  ModelSelectorLogo,
  type ModelSelectorLogoProps,
} from "@/components/ai-elements/model-selector";
import { Button } from "@/components/ui/button";
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
import { AuthContext } from "@/lib/contexts/auth-context";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import AuthInitialStep from "./auth-initial-step";

const PROVIDERS = [
  "OpenAI",
  "Anthropic",
  "Google",
  "xAI",
  "Llama",
  "DeepSeek",
  "Qwen",
  "Perplexity",
];

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Sparkles,
    title: "Multiple AI Models",
    description: "Access the best AI models in one place",
  },
  {
    icon: ImageIcon,
    title: "Multimodal",
    description: "Upload or generate images",
  },
  {
    icon: MessageSquare,
    title: "Conversation Memory",
    description: "AI remembers context across chats",
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description: "Quick responses with minimal downtime",
  },
];

type AuthPopupProps = {
  anonymousLogin?: boolean;
  hasGoogle?: boolean;
  title?: string;
  description?: string;
};

export default function AuthPopup({
  anonymousLogin = false,
  hasGoogle = false,
  title = "Log in or sign up",
  description = "Claude, ChatGPT, Gemini, Perplexity, and more, all in one place, just a few clicks away",
}: Readonly<AuthPopupProps>) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { dialogOpen, setDialogOpen } = useContext(AuthContext);

  if (isDesktop) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>Log in</Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl gap-0 p-0">
          <div className="grid md:grid-cols-2">
            <div className="bg-linear-to-br from-primary/10 via-primary/5 to-background p-10">
              <div className="flex h-full flex-col justify-start space-y-8">
                <div className="flex flex-col justify-center gap-2">
                  <h3 className="font-semibold text-2xl text-foreground">
                    Welcome to Fyzz
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Your all-in-one AI chat platform
                  </p>
                  <div className="relative mt-3 overflow-hidden">
                    {/* <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-background to-transparent" /> */}
                    {/* <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-background to-transparent" /> */}
                    <div className="flex w-max animate-scroll-infinite gap-4">
                      {[...PROVIDERS, ...PROVIDERS].map((provider, index) => (
                        <div
                          key={`${provider}-${index}`}
                          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap"
                        >
                          <ModelSelectorLogo
                            provider={
                              provider.toLowerCase() as ModelSelectorLogoProps["provider"]
                            }
                            className="size-5 text-primary"
                          />
                          <span className="font-semibold text-xs">{provider}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {FEATURES.map((feature) => (
                    <div key={feature.title} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="mb-1 font-medium text-foreground text-sm">
                          {feature.title}
                        </h4>
                        <p className="text-muted-foreground text-xs">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center p-10">
              <DialogHeader className="flex-1">
                <DialogTitle className="mb-5 text-3xl">{title}</DialogTitle>
                <DialogDescription className="text-foreground">
                  {description}
                </DialogDescription>
              </DialogHeader>
              <AuthInitialStep anonymousLogin={anonymousLogin} hasGoogle={hasGoogle} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={dialogOpen} onOpenChange={setDialogOpen}>
      <DrawerTrigger asChild>
        <Button>Log in</Button>
      </DrawerTrigger>
      <DrawerContent className="w-full px-5 pb-10">
        <DrawerHeader>
          <DrawerTitle className="my-5 text-center text-3xl">{title}</DrawerTitle>
          <DrawerDescription className="text-center text-foreground">
            {description}
          </DrawerDescription>
        </DrawerHeader>
        <AuthInitialStep anonymousLogin={anonymousLogin} hasGoogle={hasGoogle} />
      </DrawerContent>
    </Drawer>
  );
}
