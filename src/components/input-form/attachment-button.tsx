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
import { Camera, Paperclip } from "lucide-react";
import type { RefObject } from "react";

export default function AttachmentButton({
  imageSupport,
  pdfSupport,
  cameraInputRef,
  fileInputRef,
}: {
  imageSupport?: boolean;
  pdfSupport?: boolean;
  cameraInputRef: RefObject<HTMLInputElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
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
              <span>Take photo</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleFileClick}>
              <Paperclip size={16} />
              <span>Upload files</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent>
          <p>Attach files</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
