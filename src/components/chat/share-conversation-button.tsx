"use client";

import { CalendarIcon, InfinityIcon, Share } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { shareConversationUntilLatestMessage } from "@/lib/actions/conversations";
import { cn } from "@/lib/utils";
import { useState } from "react";

const buttons = [
  {
    label: "1D",
  },
  {
    label: "1W",
  },
  {
    label: "1M",
  },
];

export default function ShareConversationButton({
  conversationId,
  className,
}: { conversationId: string; className?: string }) {
  const [open, setOpen] = useState(false);

  async function handleShareConversationUntilLatestMessage(duration: string) {
    const token = await shareConversationUntilLatestMessage(conversationId, duration);
    const url = `${window.location.origin}/share/${token}`;
    await navigator.clipboard.writeText(url);

    toast.success("Copied to clipboard", {
      description: "Share this link with others.",
    });

    setOpen(false);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("size-8 p-5", className)}>
          <Share size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2" align="end">
        <DropdownMenuLabel className="text-center">
          Share conversation for
        </DropdownMenuLabel>
        <div className="flex items-center gap-1">
          {buttons.map((button) => (
            <Button
              key={button.label}
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleShareConversationUntilLatestMessage(button.label)}
            >
              {button.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            onClick={() => handleShareConversationUntilLatestMessage("INFINITY")}
          >
            <InfinityIcon size={16} />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
