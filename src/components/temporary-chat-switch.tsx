"use client";

import { MessageCircleDashed } from "lucide-react";
import { usePathname } from "next/navigation";
import { use } from "react";
import { useTranslations } from "@/lib/contexts/translations-context";
import { useModelStore } from "@/stores/model-store";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export function TemporaryChatSwitch() {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const pathname = usePathname();
  const temporaryChat = useModelStore((state) => state.temporaryChat);
  const setTemporaryChat = useModelStore((state) => state.setTemporaryChat);

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
          <p>{translations.input.modelMenu.temporaryChat}</p>
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
