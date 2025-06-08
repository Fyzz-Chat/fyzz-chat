"use client";

import { useModelStore } from "@/stores/model-store";
import { MessageCircleDashed } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export function TemporaryChatSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const { temporaryChat, setTemporaryChat } = useModelStore();

  function handleCheckedChange(checked: boolean) {
    if (pathname !== "/chat") {
      router.push("/chat");
    }
    setTemporaryChat(checked);
  }

  return (
    <div>
      <div className="flex p-1 items-center gap-2 text-sm bg-popover">
        <Label
          htmlFor="temporary-chat"
          className="flex items-center gap-2 w-full px-2 py-1.5"
        >
          <MessageCircleDashed size={16} />
          <p>Temporary chat</p>
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
