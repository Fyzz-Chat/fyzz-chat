import { Check, Copy, Edit, Loader2, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useRegenerateMessage } from "@/lib/queries/conversations";
import { cn, getMessageContent } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import { useModelStore } from "@/stores/model-store";
import type { CustomUIMessage } from "@/types/chat";
import { MessageContent } from "./message-content";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export function MessageItem({
  message,
  conversationId,
}: {
  message: CustomUIMessage;
  conversationId: string;
}) {
  const regenerateMessage = useRegenerateMessage();

  const temporaryChat = useModelStore((state) => state.temporaryChat);
  const model = useModelStore((state) =>
    state.getModel(message.metadata?.model || state.model?.id)
  );

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(getMessageContent(message));
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
      const { regenerate } = useChatStore.getState();
      regenerate(message.id);
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
      const { editMessage, regenerate } = useChatStore.getState();
      editMessage(message.id, content);
      regenerate(message.id);
    } else {
      const { emptySubmit } = useChatStore.getState();
      emptySubmit();
    }
    setInProgress(false);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setContent(getMessageContent(message));
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: Dependencies are correct as is
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
        handleCancelEdit();
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
        "group flex w-full flex-col gap-1",
        message.role === "user" ? "ml-auto max-w-[80%] items-end" : "mr-auto max-w-full"
      )}
    >
      {isEditing ? (
        <div className="flex w-full items-center gap-1">
          <TextareaAutosize
            id="edit-message"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex max-h-80 min-h-10 w-full resize-none rounded-lg border bg-transparent p-[18px] placeholder:text-muted-foreground focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="opacity-0 transition-opacity duration-100 group-hover:opacity-100"
                    />
                  ) : (
                    <Copy
                      size={18}
                      className="opacity-0 transition-opacity duration-100 group-hover:opacity-100"
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
            <div className="-bottom-8 -translate-x-1/2 absolute left-1/2 z-20 transform rounded-md border bg-background px-2 py-1 text-foreground text-xs shadow-md">
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
                    className="opacity-0 transition-opacity duration-100 group-hover:opacity-100"
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
          <div className="ml-2 flex h-full self-center opacity-0 transition-opacity duration-100 group-hover:opacity-100">
            <p className="text-muted-foreground text-xs">{model?.name}</p>
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
                  className="opacity-0 transition-opacity duration-100 group-hover:opacity-100"
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
