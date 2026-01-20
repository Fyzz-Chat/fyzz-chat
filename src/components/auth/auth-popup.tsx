"use client";

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
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import AuthInitialStep from "./auth-initial-step";

type AuthPopupProps = {
  hasGoogle?: boolean;
  title?: string;
  description?: string;
};

export default function AuthPopup({
  hasGoogle = false,
  title = "Log in or sign up",
  description = "Chat with the best AI models, all in one place upload images, files and more.",
}: Readonly<AuthPopupProps>) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Log in</Button>
        </DialogTrigger>
        <DialogContent className="py-10 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="mb-5 text-center text-3xl">{title}</DialogTitle>
            <DialogDescription className="mb-5 text-center text-white">
              {description}
            </DialogDescription>
          </DialogHeader>
          <AuthInitialStep hasGoogle={hasGoogle} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Log in</Button>
      </DrawerTrigger>
      <DrawerContent className="w-full px-5 pb-10">
        <DrawerHeader>
          <DrawerTitle className="my-5 text-center text-3xl">{title}</DrawerTitle>
          <DrawerDescription className="mb-5 text-center text-white">
            {description}
          </DrawerDescription>
        </DrawerHeader>
        <AuthInitialStep hasGoogle={hasGoogle} />
      </DrawerContent>
    </Drawer>
  );
}
