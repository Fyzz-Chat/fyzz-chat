import { Download, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ImageFilePart({
  url,
  name = "",
  mediaType = "image/png",
}: {
  url: string;
  name?: string;
  mediaType?: string;
}) {
  const isBase64Image = url.startsWith("data:image");

  if (isBase64Image) {
    url = base64ToDownloadableUrl(url, mediaType);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group/image relative w-full max-w-md cursor-pointer">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={url}
              alt={name}
              className="h-auto w-full object-contain transition-all duration-200 group-hover/image:brightness-50"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/image:opacity-100">
              <Maximize2 className="size-5 text-white" />
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="w-fit max-w-[95vw] gap-0 overflow-hidden rounded-lg bg-background p-0 [&>button]:hidden">
        <DialogHeader className="flex h-12 flex-row items-center justify-end gap-2 space-y-0 px-4">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <DialogDescription className="sr-only">Image preview</DialogDescription>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hover:bg-transparent hover:text-foreground"
          >
            <a href={url} download={name || "image"} rel="noopener noreferrer">
              <Download size={20} />
            </a>
          </Button>
          <DialogClose>
            <X size={20} />
          </DialogClose>
        </DialogHeader>
        <div className="flex items-center justify-center">
          <img src={url} alt={name} className="max-h-[75vh] object-contain" />
        </div>
        {name && (
          <DialogFooter className="flex h-24 flex-row items-center justify-between gap-4 p-4">
            <p className="truncate text-pretty font-medium text-sm text-white">{name}</p>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function base64ToDownloadableUrl(base64: string, mediaType: string) {
  const base64Data = base64.split(",")[1];

  const binaryString = window.atob(base64Data);

  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: mediaType });

  return URL.createObjectURL(blob);
}
