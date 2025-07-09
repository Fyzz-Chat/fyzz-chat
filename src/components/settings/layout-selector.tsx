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
import type { Dictionary } from "@/types/locale";

export function LayoutSelector({
  dict,
}: { dict: Dictionary["settings"]["display"]["layout"] }) {
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
          <span>{layout === "wide" ? dict.options.wide : dict.options.compact}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLayout("wide")} className="gap-2">
          <IconViewportWide size={16} />
          <span>{dict.options.wide}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLayout("compact")} className="gap-2">
          <IconViewportNarrow size={16} />
          <span>{dict.options.compact}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
