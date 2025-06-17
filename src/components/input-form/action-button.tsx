"use client";

import IconPlayerStop from "@/components/icons/icon-player-stop";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/lib/contexts/chat-context";
import { useInputStore } from "@/stores/input-store";
import { Send } from "lucide-react";

export default function ActionButton() {
  const { status, stop, error } = useChatContext();
  const { input } = useInputStore();

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
