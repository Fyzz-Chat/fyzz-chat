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
import type { Translations } from "@/types/locale";

export function LayoutSelector({
  translations,
}: { translations: Translations["settings"]["display"]["layout"] }) {
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
            {layout === "wide" ? translations.options.wide : translations.options.compact}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLayout("wide")} className="gap-2">
          <IconViewportWide size={16} />
          <span>{translations.options.wide}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLayout("compact")} className="gap-2">
          <IconViewportNarrow size={16} />
          <span>{translations.options.compact}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
