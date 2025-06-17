"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFileStore } from "@/stores/file-store";
import { FileText, Trash } from "lucide-react";
import Image from "next/image";

export default function FileList() {
  const { files, setFiles } = useFileStore();

  return (
    <div
      className="flex items-center w-full gap-2 transition-all duration-300"
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
                    <div className="flex items-center justify-center h-full border rounded-md">
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
            className="absolute -top-3 -right-3 rounded-full size-6 bg-muted border z-10"
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
