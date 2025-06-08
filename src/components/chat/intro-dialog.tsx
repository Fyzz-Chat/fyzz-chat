import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { countModels } from "@/lib/backend/providers";
import { Brain, CodeXml, FileText, Globe, Image } from "lucide-react";
import IntroDialogDescription from "./intro-dialog-description";

export default function Examples() {
  const numModels = countModels();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Which model should I use?</Button>
      </DialogTrigger>
      <DialogContent className="px-0">
        <DialogHeader className="px-6">
          <DialogTitle>We have {numModels} models</DialogTitle>
          <DialogDescription>Which one should you use?</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[350px]">
          <div className="flex flex-col gap-4 px-6 pb-4 sm:pb-0">
            <p>
              Models with the <Image className="inline-flex text-orange-500" /> can
              analyze uploaded images.
            </p>
            <p>
              Models with the <FileText className="inline-flex text-purple-500" /> icon
              can analyze uploaded PDFs.
            </p>
            <p>
              Models with the <Brain className="inline-flex text-yellow-500" /> icon take
              time to respond. Use them for complex questions.
            </p>
            <p>
              Models with the <Globe className="inline-flex text-blue-500" /> icon have
              internet access.
            </p>
            <p>
              Models with the <CodeXml className="inline-flex text-green-500" /> icon are
              ideal for coding questions.
            </p>
            <p>
              But generally, all models are general-purpose. Experiment to find the best
              fit for you.
            </p>
            <p>
              Click the model's <IntroDialogDescription /> in the lower left corner of the
              input field to switch models.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
