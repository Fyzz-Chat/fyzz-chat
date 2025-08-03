"use client";

import IconViewportNarrow from "@/components/icons/icon-viewport-narrow";
import IconViewportWide from "@/components/icons/icon-viewport-wide";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatLayout } from "@/lib/contexts/chat-layout-context";
import { useTranslations } from "@/lib/contexts/translations-context";
import { use } from "react";

export function LayoutSelector() {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const { layout, setLayout } = useChatLayout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {layout === "wide" ? (
            <IconViewportWide size={16} />
          ) : (
            <IconViewportNarrow size={16} />
          )}
          <span>
            {layout === "wide"
              ? translations.settings.display.layout.options.wide
              : translations.settings.display.layout.options.compact}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLayout("wide")} className="gap-2">
          <IconViewportWide size={16} />
          <span>{translations.settings.display.layout.options.wide}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLayout("compact")} className="gap-2">
          <IconViewportNarrow size={16} />
          <span>{translations.settings.display.layout.options.compact}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
