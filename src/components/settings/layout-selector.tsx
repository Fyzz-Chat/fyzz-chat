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

export function LayoutSelector() {
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
          <span>{layout === "wide" ? "Wide" : "Compact"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLayout("wide")} className="gap-2">
          <IconViewportWide size={16} />
          <span>Wide</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLayout("compact")} className="gap-2">
          <IconViewportNarrow size={16} />
          <span>Compact</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
