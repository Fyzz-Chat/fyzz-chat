"use client";

import { FileText, Trash } from "lucide-react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isFileList } from "@/lib/utils";
import { useFileStore } from "@/stores/file-store";

export default function FileList() {
  const files = useFileStore((state) => state.files);
  const setFiles = useFileStore((state) => state.setFiles);

  if (!isFileList(files)) {
    return null;
  }

  return (
    <div
      className="flex w-full items-center gap-2 transition-all duration-300"
      style={{
        marginBottom: files && files.length > 0 ? "16px" : "0px",
        height: files && files.length > 0 ? "54px" : "0px",
      }}
    >
      {Array.from(files || []).map((file, index) => (
        <div key={`${file.name}-${index}`} className="relative w-24">
          <AspectRatio ratio={16 / 9} className="bg-muted">
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  {file.type.startsWith("image/") ? (
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      fill
                      className="size-full rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-md border">
                      <FileText size={24} />
                    </div>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{file.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </AspectRatio>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute -top-3 -right-3 z-10 size-6 rounded-full border bg-muted"
            onClick={() => {
              const fileList = Array.from(files || []);
              const newFiles = new DataTransfer();
              for (let i = 0; i < fileList.length; i++) {
                if (fileList[i] !== file) {
                  newFiles.items.add(fileList[i]);
                }
              }
              setFiles(newFiles.files);
            }}
          >
            <Trash size={12} />
          </Button>
        </div>
      ))}
    </div>
  );
}
