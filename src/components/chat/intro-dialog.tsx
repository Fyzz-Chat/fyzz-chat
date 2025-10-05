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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from "@/lib/contexts/translations-context";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Brain, CodeXml, FileText, Globe, Image } from "lucide-react";
import { use } from "react";

export default function Examples() {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const trpc = useTRPC();
  const { data: numModels } = useQuery(
    trpc.numModels.queryOptions(undefined, {
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    })
  );
  const title = translations.home.welcome.modal.title.replace(
    "{modelCount}",
    numModels?.toString() ?? "0"
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{translations.home.welcome.modal.trigger}</Button>
      </DialogTrigger>
      <DialogContent className="px-0">
        <DialogHeader className="px-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {translations.home.welcome.modal.description}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[350px]">
          <div className="flex flex-col gap-4 px-6 pb-4 sm:pb-0">
            <p>
              <Image className="inline-flex text-orange-500" />:{" "}
              {translations.home.welcome.modal.types.image}
            </p>
            <p>
              <FileText className="inline-flex text-purple-500" />:{" "}
              {translations.home.welcome.modal.types.pdf}
            </p>
            <p>
              <Brain className="inline-flex text-yellow-500" />:{" "}
              {translations.home.welcome.modal.types.reasoning}
            </p>
            <p>
              <Globe className="inline-flex text-blue-500" />:{" "}
              {translations.home.welcome.modal.types.internet}
            </p>
            <p>
              <CodeXml className="inline-flex text-green-500" />:{" "}
              {translations.home.welcome.modal.types.coding}
            </p>
            <p>{translations.home.welcome.modal.general}</p>
            <p className="md:hidden">
              {translations.home.welcome.modal.switchModel.mobile}
            </p>
            <p className="hidden md:block">
              {translations.home.welcome.modal.switchModel.desktop}
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
