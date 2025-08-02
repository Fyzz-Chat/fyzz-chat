import { useRegenerateMessage } from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import { useModelStore } from "@/stores/model-store";
import type { Message } from "ai";
import { Check, Copy, Edit, Loader2, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { MessageContent } from "./message-content";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export function MessageItem({
  message,
  conversationId,
}: { message: Message & { model?: string }; conversationId: string }) {
  const regenerateMessage = useRegenerateMessage();

  const temporaryChat = useModelStore((state) => state.temporaryChat);
  const getModel = useModelStore((state) => state.getModel);

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(message.content);
  const [inProgress, setInProgress] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  async function handleRegenerateMessage() {
    setInProgress(true);
    await regenerateMessage.mutateAsync({
      messageId: message.id,
      conversationId,
      temporaryChat,
    });

    if (temporaryChat) {
      const { deleteMessagesAfter, reload } = useChatStore.getState();
      deleteMessagesAfter(message.id);
      reload();
    } else {
      const { emptySubmit } = useChatStore.getState();
      emptySubmit();
    }
    setInProgress(false);
  }

  async function handleEditMessage() {
    setIsEditing(true);
  }

  async function handleSaveMessage() {
    setInProgress(true);
    await regenerateMessage.mutateAsync({
      messageId: message.id,
      conversationId,
      temporaryChat,
      newContent: content,
    });
    setIsEditing(false);

    if (temporaryChat) {
      const { deleteMessagesAfter, reload } = useChatStore.getState();
      deleteMessagesAfter(message.id, content);
      reload();
    } else {
      const { emptySubmit } = useChatStore.getState();
      emptySubmit();
    }
    setInProgress(false);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setContent(message.content);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  useEffect(() => {
    if (isEditing) {
      const textarea = document.getElementById("edit-message") as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditing(false);
      }
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isEditing]);

  return (
    <div
      data-message-id={message.id}
      className={cn(
        "flex flex-col gap-1 group w-full",
        message.role === "user" ? "ml-auto max-w-[80%] items-end" : "mr-auto max-w-full"
      )}
    >
      {isEditing ? (
        <div className="flex items-center gap-1 w-full">
          <TextareaAutosize
            id="edit-message"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex min-h-10 max-h-80 w-full bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none border rounded-lg p-[18px]"
          />
        </div>
      ) : (
        <MessageContent message={message} />
      )}
      <div
        className={cn(
          "flex items-start gap-1 text-muted-foreground",
          message.role === "user" && "flex-row-reverse"
        )}
      >
        {isEditing && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 p-0"
              onClick={handleCancelEdit}
              disabled={inProgress}
            >
              <X size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 p-0"
              onClick={handleSaveMessage}
              disabled={inProgress}
            >
              {inProgress ? <Loader2 className="animate-spin" /> : <Check size={18} />}
            </Button>
          </>
        )}
        <div className="relative">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-8 p-0",
                    message.role === "user" && isEditing && "hidden"
                  )}
                  onClick={handleCopy}
                >
                  {isCopied ? (
                    <Check
                      size={18}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                    />
                  ) : (
                    <Copy
                      size={18}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                    />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p>Copy message</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {isCopied && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-background text-foreground px-2 py-1 rounded-md text-xs border shadow-md z-20">
              Copied!
            </div>
          )}
        </div>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-8 p-0",
                  message.role === "user" && isEditing && "hidden"
                )}
                onClick={handleRegenerateMessage}
                disabled={inProgress}
              >
                {inProgress ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <RefreshCw
                    size={18}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                  />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>Regenerate response</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {message.role === "assistant" && (
          <div className="flex h-full self-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
            <p className="text-xs text-muted-foreground">
              {getModel(message.model)?.name}
            </p>
          </div>
        )}
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-8 p-0",
                  (message.role !== "user" || isEditing) && "hidden"
                )}
                onClick={handleEditMessage}
              >
                <Edit
                  size={18}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>Edit message</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
