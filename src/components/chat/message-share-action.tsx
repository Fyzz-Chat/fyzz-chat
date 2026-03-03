"use client";

import { CheckIcon, CopyIcon, Loader2, ShareIcon, TimerIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MessageAction } from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDeleteShare, useShareConversation } from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";
import type { ShareInfo } from "@/types/chat";

const DURATIONS = [
  { value: "1D", label: "1 day" },
  { value: "1W", label: "1 week" },
  { value: "1M", label: "1 month" },
  { value: "INFINITY", label: "Forever" },
];

function formatExpiration(expiresAt: Date | null): string {
  if (!expiresAt) {
    return "Never";
  }
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    return "Expired";
  }
  if (days === 1) {
    return "1 day";
  }
  return `${days} days`;
}

export default function MessageShareAction({
  conversationId,
  messageId,
  share,
}: Readonly<{
  conversationId: string;
  messageId: string;
  share?: ShareInfo;
}>) {
  const shareMutation = useShareConversation();
  const deleteShareMutation = useDeleteShare();
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [waitForDeleteConfirmation, setWaitForDeleteConfirmation] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>(
    share ? `${globalThis.location.origin}/share/${share.id}` : ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async (duration: string) => {
    setIsLoading(true);
    try {
      const shareId = await shareMutation.mutateAsync({
        conversationId,
        messageId,
        duration,
      });
      const url = `${globalThis.location.origin}/share/${shareId}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard!");
    } catch {
      toast.error("Failed to create share link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteShare = async () => {
    if (!waitForDeleteConfirmation) {
      setWaitForDeleteConfirmation(true);
      setTimeout(() => setWaitForDeleteConfirmation(false), 1500);
      return;
    }

    if (!share) return;
    try {
      await deleteShareMutation.mutateAsync(share.id);
      toast.success("Share deleted successfully");
      setIsOpen(false);
    } catch {
      toast.error("Failed to delete share. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <MessageAction
          label="Share"
          tooltip={
            share
              ? "Conversation shared up to this message"
              : "Share conversation up to this message"
          }
        >
          <ShareIcon className={cn("size-4", share ? "text-(--theme-blue)" : "")} />
        </MessageAction>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {share ? "Shared conversation" : "Share conversation"}
          </DialogTitle>
          <DialogDescription>
            {share
              ? "This conversation is shared up to the current message."
              : "Create a shareable link for this conversation up to the current message."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {share ? (
            <div className="flex items-center gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm"
              />
              <Button
                size="icon"
                onClick={() => {
                  setIsCopied(true);
                  navigator.clipboard.writeText(shareUrl);
                  toast.success("Copied to clipboard!");
                  setTimeout(() => setIsCopied(false), 1500);
                }}
              >
                {isCopied ? (
                  <CheckIcon className="size-4" />
                ) : (
                  <CopyIcon className="size-4" />
                )}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {DURATIONS.map((duration) => (
                <Button
                  variant="outline"
                  key={duration.value}
                  onClick={() => handleShare(duration.value)}
                  disabled={isLoading}
                >
                  {duration.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        {share && (
          <DialogFooter className="flex items-center justify-between">
            <div className="mr-auto flex items-center gap-2 text-muted-foreground text-sm">
              <TimerIcon className="size-4" />
              <span className="">{formatExpiration(share.expiresAt)}</span>
            </div>
            <p className="text-muted-foreground text-sm">
              {waitForDeleteConfirmation ? "Click again to delete" : ""}
            </p>
            <Button
              className="w-28"
              variant="destructive"
              onClick={handleDeleteShare}
              disabled={deleteShareMutation.isPending}
            >
              {deleteShareMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              <span>{waitForDeleteConfirmation ? "Delete?" : "Delete"}</span>
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
