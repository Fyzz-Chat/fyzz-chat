"use client";

import type { TextUIPart } from "ai";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { MessageAction } from "@/components/ai-elements/message";
import type { CustomUIMessage } from "@/types/chat";

export default function MessageCopyAction({
  message,
}: Readonly<{ message: CustomUIMessage }>) {
  const [isCopied, setIsCopied] = useState(false);

  async function handleCopy() {
    const textContent = message.parts.find(
      (part): part is TextUIPart => part.type === "text"
    )?.text;
    if (!navigator.clipboard?.writeText) {
      return;
    }
    try {
      await navigator.clipboard.writeText(textContent ?? "");
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch {
      setIsCopied(false);
    }
  }

  return (
    <MessageAction label="Copy" tooltip="Copy message" onClick={handleCopy}>
      {isCopied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
    </MessageAction>
  );
}
