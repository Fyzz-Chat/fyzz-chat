"use client";

import { ShareIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MessageAction } from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useShareConversation } from "@/lib/queries/conversations";

const DURATIONS = [
  { value: "1D", label: "1 day" },
  { value: "1W", label: "1 week" },
  { value: "1M", label: "1 month" },
  { value: "INFINITY", label: "Forever" },
];

export default function MessageShareAction({
  conversationId,
  messageId,
}: Readonly<{
  conversationId: string;
  messageId: string;
}>) {
  const shareMutation = useShareConversation();
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <MessageAction label="Share" tooltip="Share conversation up to this message">
          <ShareIcon className="size-4" />
        </MessageAction>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share conversation</DialogTitle>
          <DialogDescription>
            Create a shareable link for this conversation up to the current message.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {shareUrl ? (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Share link created:</p>
              <div className="flex items-center gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast.success("Copied to clipboard!");
                  }}
                >
                  Copy
                </Button>
              </div>
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
      </DialogContent>
    </Dialog>
  );
}
