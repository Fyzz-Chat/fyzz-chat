"use client";

import IconPlayerStop from "@/components/icons/icon-player-stop";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/lib/contexts/chat-context";
import {
  useAddMessage,
  useCreateConversation,
  useCreateConversationOptimistic,
} from "@/lib/queries/conversations";
import { Camera, FileText, Paperclip, Send, Trash } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  forwardRef,
  memo,
  useEffect,
  useRef,
} from "react";
import TextareaAutosize from "react-textarea-autosize";

import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useFileStore } from "@/stores/file-store";
import { useInputStore } from "@/stores/input-store";
import { useModelStore } from "@/stores/model-store";
import type { PartialConversation } from "@/types/chat";
import type { Attachment } from "ai";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { ModelMenu } from "./model-menu";
import { AspectRatio } from "./ui/aspect-ratio";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const MemoizedModelMenu = memo(ModelMenu);

function fileToAttachment(file: File): Attachment {
  return {
    name: file.name,
    contentType: file.type,
    url: URL.createObjectURL(file),
  };
}

const InputForm = forwardRef<HTMLTextAreaElement, { className?: string }>(
  ({ className }, ref) => {
    const router = useRouter();
    const pathname = usePathname();
    const isMobile = useMediaQuery("(max-width: 640px)");
    const createConversation = useCreateConversation();
    const createConversationOptimistic = useCreateConversationOptimistic();
    const addMessage = useAddMessage();
    const { input, setInput } = useInputStore();
    const { model, temporaryChat } = useModelStore();
    const { stableId, status, stop, error, setChatInput } = useChatContext();
    const { files, setFiles } = useFileStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const imageSupport = model?.features?.some((feature) => feature.name === "Images");
    const pdfSupport = model?.features?.some((feature) => feature.name === "PDFs");

    async function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
      if (e.key === "Enter" && !e.shiftKey && !isMobile) {
        e.preventDefault();
        await handleSendMessage(e);
      }
    }

    async function handleSendMessage(
      e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>
    ) {
      e.preventDefault();
      if (!input.trim()) return;

      if (status !== "ready") return;

      if (pathname === "/chat") {
        const optimisticConversation: PartialConversation = {
          id: stableId,
          title: "New Chat",
          model: model.id,
          messages: [],
          lastMessageAt: new Date(),
        };

        if (temporaryChat) {
          await createConversationOptimistic.mutateAsync(optimisticConversation);
        } else {
          await createConversation.mutateAsync(optimisticConversation);
        }

        const url = temporaryChat ? `/chat/${stableId}/temp` : `/chat/${stableId}`;
        router.push(url);
      }

      const messageId = setChatInput(input);
      await addMessage.mutateAsync({
        message: {
          id: messageId,
          content: input,
          role: "user",
          experimental_attachments: files ? Array.from(files).map(fileToAttachment) : [],
        },
        conversationId: stableId,
      });
      setInput("");
    }

    function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
      const clipboardItems = e.clipboardData.items;

      // Check if clipboard contains any files
      const hasFiles = Array.from(clipboardItems).some((item) => item.kind === "file");

      if (hasFiles) {
        e.preventDefault();

        const newFiles = new DataTransfer();
        // First add existing files if any
        if (files) {
          Array.from(files).forEach((existingFile) => {
            newFiles.items.add(existingFile);
          });
        }

        const imageItems = Array.from(clipboardItems).filter(
          (item) =>
            item.type === "image/png" ||
            item.type === "image/jpeg" ||
            item.type === "image/jpg" ||
            item.type === "image/webp"
        );

        if (imageItems.length > 0 && imageSupport) {
          imageItems.forEach((imageItem) => {
            const file = imageItem.getAsFile();
            if (file) {
              newFiles.items.add(file);
            }
          });

          setFiles(newFiles.files);
        }

        const pdfItems = Array.from(clipboardItems).filter(
          (item) => item.type === "application/pdf"
        );

        if (pdfItems.length > 0 && pdfSupport) {
          pdfItems.forEach((pdfItem) => {
            const file = pdfItem.getAsFile();
            if (file) {
              newFiles.items.add(file);
            }
          });

          setFiles(newFiles.files);
        }
      }
    }

    function handleCameraClick() {
      cameraInputRef.current?.click();
    }

    function handlePhotoCapture(event: ChangeEvent<HTMLInputElement>) {
      if (event.target.files && event.target.files.length > 0) {
        try {
          // Ensure we have a valid file
          const file = event.target.files[0];
          if (!file.type.startsWith("image/")) {
            console.error("Invalid file type from camera");
            return;
          }

          // Create a new File object to ensure proper handling
          const processedFile = new File(
            [file],
            `camera-${Date.now()}.${file.type.split("/")[1]}`,
            {
              type: file.type,
            }
          );

          // Create a new FileList with the processed file
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(processedFile);

          setFiles(dataTransfer.files);
        } catch (error) {
          console.error("Error processing camera input:", error);
        }
      }
    }

    useEffect(() => {
      if (!files && fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (files && cameraInputRef.current) {
        cameraInputRef.current.value = "";
      }
    }, [files]);
    return (
      <div
        className={cn(
          "flex-none pt-1 sm:px-4 sm:pb-4 w-full bg-background rounded-b-[20px]",
          className
        )}
      >
        <form
          onSubmit={handleSendMessage}
          className={cn(
            "flex flex-col items-end border rounded-t-xl sm:rounded-b-xl p-4 bg-card transition-colors",
            temporaryChat && "dark:bg-black"
          )}
        >
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
          <TextareaAutosize
            id="message-input"
            ref={ref}
            placeholder={isMobile ? "Enter message" : "(Shift + Enter for new line)"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            rows={1}
            className="flex min-h-10 max-h-80 w-full bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-sm resize-none"
          />
          <Input
            ref={cameraInputRef}
            type="file"
            capture="environment"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoCapture}
          />
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(event) => {
              if (event.target.files) {
                setFiles(event.target.files);
              }
            }}
            accept={`${imageSupport ? "image/png,image/jpeg,image/jpg,image/webp" : ""}${imageSupport && pdfSupport ? "," : ""}${pdfSupport ? "application/pdf" : ""}`}
            className="hidden"
          />
          <div className="flex items-center w-full gap-2">
            <div className="flex items-center gap-2 mr-auto">
              <MemoizedModelMenu />
            </div>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="shrink-0 size-9"
                        disabled={!imageSupport && !pdfSupport}
                      >
                        <Paperclip size={16} />
                      </Button>
                    </TooltipTrigger>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <DropdownMenuItem
                      onClick={handleCameraClick}
                      className="flex lg:hidden"
                    >
                      <Camera size={16} />
                      <span>Take photo</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
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
            {status === "submitted" || status === "streaming" ? (
              <Button
                type="submit"
                size="icon"
                className="shrink-0 size-9"
                onClick={() => stop()}
              >
                <IconPlayerStop size={16} />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                className="shrink-0 size-9"
                disabled={
                  input.trim() === "" || (error && error.message === "content_filter")
                }
              >
                <Send size={16} />
              </Button>
            )}
          </div>
        </form>
      </div>
    );
  }
);

InputForm.displayName = "InputForm";

export default InputForm;
