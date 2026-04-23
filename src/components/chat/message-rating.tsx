"use client";

import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { toast } from "sonner";
import { MessageAction } from "@/components/ai-elements/message";
import {
  useRateMessage,
  useRatingsForConversation,
  useUnrateMessage,
} from "@/lib/queries/ratings";
import { cn } from "@/lib/utils";

export default function MessageRating({
  conversationId,
  messageId,
}: Readonly<{
  conversationId: string;
  messageId: string;
}>) {
  const { data: ratings } = useRatingsForConversation(conversationId);
  const rateMutation = useRateMessage(conversationId);
  const unrateMutation = useUnrateMessage(conversationId);

  const current = ratings?.find((r) => r.messageId === messageId)?.value ?? null;
  const isPending = rateMutation.isPending || unrateMutation.isPending;

  function handleClick(target: 1 | -1) {
    if (current === target) {
      unrateMutation.mutate(messageId, {
        onSuccess: (result) => {
          if (!result.ok) toast.error(result.message);
        },
      });
    } else {
      rateMutation.mutate(
        { messageId, value: target },
        {
          onSuccess: (result) => {
            if (!result.ok) toast.error(result.message);
          },
        }
      );
    }
  }

  return (
    <>
      <MessageAction
        label="Good response"
        tooltip="Good response"
        onClick={() => handleClick(1)}
        disabled={isPending}
        className={cn(current === 1 && "text-primary")}
      >
        <ThumbsUpIcon className={cn("size-4", current === 1 && "fill-primary")} />
      </MessageAction>
      <MessageAction
        label="Bad response"
        tooltip="Bad response"
        onClick={() => handleClick(-1)}
        disabled={isPending}
        className={cn(current === -1 && "text-destructive")}
      >
        <ThumbsDownIcon className={cn("size-4", current === -1 && "fill-destructive")} />
      </MessageAction>
    </>
  );
}
