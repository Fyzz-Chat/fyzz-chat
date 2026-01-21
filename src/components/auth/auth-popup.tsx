"use client";

import { ImageIcon, type LucideIcon, MessageSquare, Sparkles, Zap } from "lucide-react";
import { useContext } from "react";
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
  hasGoogle?: boolean;
  title?: string;
  description?: string;
};

export default function AuthPopup({
  hasGoogle = false,
  title = "Log in or sign up",
  description = "Community version, free to use forever",
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
              <div className="flex h-full flex-col justify-center space-y-8">
                <div>
                  <h3 className="mb-2 font-semibold text-2xl text-foreground">
                    Welcome to Fyzz
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Your all-in-one AI chat platform
                  </p>
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

            <div className="p-10">
              <DialogHeader>
                <DialogTitle className="mb-5 text-3xl">{title}</DialogTitle>
                <DialogDescription className="text-foreground">
                  {description}
                </DialogDescription>
              </DialogHeader>
              <AuthInitialStep hasGoogle={hasGoogle} />
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
        <AuthInitialStep hasGoogle={hasGoogle} />
      </DrawerContent>
    </Drawer>
  );
}
