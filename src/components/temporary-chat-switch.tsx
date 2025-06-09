"use client";

import { useModelStore } from "@/stores/model-store";
import { MessageCircleDashed } from "lucide-react";
import { usePathname } from "next/navigation";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export function TemporaryChatSwitch() {
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

  return (
    <div>
      <div className="flex p-1 items-center gap-2 text-sm bg-popover">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Label
                htmlFor="temporary-chat"
                className={`flex items-center gap-2 w-full px-2 py-1.5 ${
                  isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <MessageCircleDashed size={16} />
                <p>Temporary chat</p>
                <Switch
                  id="temporary-chat"
                  className="ml-auto"
                  checked={temporaryChat}
                  disabled={isDisabled}
                  onCheckedChange={handleCheckedChange}
                />
              </Label>
            </TooltipTrigger>
            {isDisabled && (
              <TooltipContent side="bottom">
                <p>Temporary chat can only be toggled when creating a new chat</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
