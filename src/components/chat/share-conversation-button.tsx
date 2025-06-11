"use client";

import { Share } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { shareConversationUntilLatestMessage } from "@/lib/actions/conversations";
import { cn } from "@/lib/utils";

export default function ShareConversationButton({
  conversationId,
  className,
}: { conversationId: string; className?: string }) {
  async function handleShareConversationUntilLatestMessage() {
    const token = await shareConversationUntilLatestMessage(conversationId);
    const url = `${window.location.origin}/share/${token}`;
    await navigator.clipboard.writeText(url);

    toast.success("Copied to clipboard", {
      description: "Share this link with others.",
    });
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("size-8 p-5", className)}
            onClick={handleShareConversationUntilLatestMessage}
          >
            <Share size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Share conversation</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
