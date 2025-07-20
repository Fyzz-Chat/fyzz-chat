"use client";

import IconPlayerStop from "@/components/icons/icon-player-stop";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/chat-store";
import { useInputStore } from "@/stores/input-store";
import { Send } from "lucide-react";

export default function ActionButton() {
  const status = useChatStore((state) => state.status);
  const stop = useChatStore((state) => state.stop);
  const error = useChatStore((state) => state.error);
  const input = useInputStore((state) => state.input);

  return status === "submitted" || status === "streaming" ? (
    <Button type="submit" size="icon" className="shrink-0 size-9" onClick={() => stop()}>
      <IconPlayerStop size={16} />
    </Button>
  ) : (
    <Button
      type="submit"
      size="icon"
      className="shrink-0 size-9"
      disabled={input.trim() === "" || (error && error.message === "content_filter")}
    >
      <Send size={16} />
    </Button>
  );
}
