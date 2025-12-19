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
      <div className="flex items-center gap-2 bg-popover p-1 text-sm">
        <Label
          htmlFor="temporary-chat"
          className="flex w-full cursor-pointer items-center gap-2 px-2 py-1.5"
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
