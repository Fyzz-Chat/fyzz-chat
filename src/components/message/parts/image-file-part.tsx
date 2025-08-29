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
import { Download, Maximize2, X } from "lucide-react";

export default function ImageFilePart({
  url,
  name = "",
}: { url: string; name?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group/image relative w-full max-w-md cursor-pointer">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={url}
              alt={name}
              className="w-full h-auto object-contain group-hover/image:brightness-50 transition-all duration-200"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-200">
              <Maximize2 className="size-5 text-white" />
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="w-fit max-w-[95vw] p-0 overflow-hidden bg-background rounded-lg gap-0 [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-end h-12 px-4 gap-2 space-y-0">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <DialogDescription className="sr-only">Image preview</DialogDescription>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hover:bg-transparent hover:text-foreground"
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
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
          <DialogFooter className="flex flex-row items-center justify-between h-24 p-4 gap-4">
            <p className="text-white text-sm font-medium text-pretty truncate">{name}</p>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
