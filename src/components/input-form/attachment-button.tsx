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
import type { Dictionary } from "@/types/locale";
import { Camera, Paperclip } from "lucide-react";
import type { RefObject } from "react";

export default function AttachmentButton({
  imageSupport,
  pdfSupport,
  cameraInputRef,
  fileInputRef,
  dict,
}: {
  imageSupport?: boolean;
  pdfSupport?: boolean;
  cameraInputRef: RefObject<HTMLInputElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  dict: Dictionary["input"]["attach"];
}) {
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
              <span>{dict.camera}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleFileClick}>
              <Paperclip size={16} />
              <span>{dict.file}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent>
          <p>{dict.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
