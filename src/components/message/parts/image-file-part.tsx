import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Maximize2 } from "lucide-react";

export default function ImageFilePart({ url, name }: { url: string; name?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group/image relative w-full max-w-md cursor-pointer">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={url}
              alt={name || "User uploaded image"}
              className="w-full h-auto object-contain group-hover/image:brightness-50 transition-all duration-200"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-200">
              <Maximize2 className="size-5 text-white" />
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="w-fit h-fit max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-background rounded-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>{name || "User uploaded image"}</DialogTitle>
          <DialogDescription>Full size view of the uploaded image</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <img
            src={url}
            alt={name || "User uploaded image"}
            className="w-auto h-auto max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
          />
          {name && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-white text-sm font-medium">{name}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
