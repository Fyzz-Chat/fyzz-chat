"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { MessageAction } from "@/components/ai-elements/message";
import { cn } from "@/lib/utils";

export default function MessageRegenerateAction({
  messageId,
  onRegenerate,
}: Readonly<{
  messageId: string;
  onRegenerate?: (messageId: string) => Promise<void>;
}>) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  async function handleRegenerate() {
    if (!onRegenerate || isRegenerating) return;

    setIsRegenerating(true);
    try {
      await onRegenerate(messageId);
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <MessageAction
      label="Regenerate"
      tooltip="Regenerate response"
      onClick={handleRegenerate}
      disabled={isRegenerating}
    >
      <RotateCcw
        className={cn(
          "size-4 scale-x-[-1]",
          isRegenerating ? "direction-reverse animate-spin" : ""
        )}
      />
    </MessageAction>
  );
}
