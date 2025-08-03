"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useModelStore } from "@/stores/model-store";
import type { Translations } from "@/types/locale";
import { Camera, Paperclip } from "lucide-react";
import { type RefObject, use } from "react";

export default function AttachmentButton({
  cameraInputRef,
  fileInputRef,
  translationsPromise,
}: {
  cameraInputRef: RefObject<HTMLInputElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  translationsPromise: Promise<Translations>;
}) {
  const translations = use(translationsPromise);
  const imageSupport = useModelStore((state) => state.isImageSupportEnabled());
  const pdfSupport = useModelStore((state) => state.isPdfSupportEnabled());

  function handleCameraClick() {
    cameraInputRef.current?.click();
  }

  function handleFileClick() {
    fileInputRef.current?.click();
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="shrink-0 size-9 p-5"
                disabled={!imageSupport && !pdfSupport}
              >
                <Paperclip size={16} />
              </Button>
            </TooltipTrigger>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
            <DropdownMenuItem onClick={handleCameraClick} className="flex lg:hidden">
              <Camera size={16} />
              <span>{translations.input.attach.camera}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleFileClick}>
              <Paperclip size={16} />
              <span>{translations.input.attach.file}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent>
          <p>{translations.input.attach.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
