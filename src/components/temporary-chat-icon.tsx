"use client";

import { cn } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import IconSpy from "./icons/icon-spy";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export default function TemporaryChatIcon({
  className,
}: {
  className?: string;
}) {
  const { temporaryChat, setTemporaryChat } = useModelStore();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/chat" && !pathname.includes("/temp")) {
      setTemporaryChat(false);
    }
  }, [pathname]);

  return (
    temporaryChat && (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className={cn("grid place-items-center", className)}>
              <IconSpy size={16} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>This conversation</p>
            <ul className="list-disc list-inside">
              <li>Won't appear in your chat history</li>
              <li>Won't be saved on our servers</li>
              <li>Will only exist until you start a new one</li>
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  );
}
