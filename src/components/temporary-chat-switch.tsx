"use client";

import { useModelStore } from "@/stores/model-store";
import type { Dictionary } from "@/types/locale";
import { MessageCircleDashed } from "lucide-react";
import { usePathname } from "next/navigation";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export function TemporaryChatSwitch({
  dict,
}: { dict: Dictionary["input"]["modelMenu"]["temporaryChat"] }) {
  const pathname = usePathname();
  const { temporaryChat, setTemporaryChat } = useModelStore();

  const isNewChat = pathname === "/chat";
  const isDisabled = !isNewChat;

  function handleCheckedChange(checked: boolean) {
    if (!isNewChat) {
      return;
    }
    setTemporaryChat(checked);
  }
  if (isDisabled) {
    return null;
  }

  return (
    <div>
      <div className="flex p-1 items-center gap-2 text-sm bg-popover">
        <Label
          htmlFor="temporary-chat"
          className="flex items-center gap-2 w-full px-2 py-1.5 cursor-pointer"
        >
          <MessageCircleDashed size={16} />
          <p>{dict}</p>
          <Switch
            id="temporary-chat"
            className="ml-auto"
            checked={temporaryChat}
            onCheckedChange={handleCheckedChange}
          />
        </Label>
      </div>
    </div>
  );
}
