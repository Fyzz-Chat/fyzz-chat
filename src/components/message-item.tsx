import { useChatContext } from "@/lib/contexts/chat-context";
import { useRegenerateMessage } from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import type { Message } from "ai";
import { Check, Copy, Edit, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { MessageContent } from "./message-content";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export function MessageItem({
  message,
  conversationId,
}: { message: Message; conversationId: string }) {
  const regenerateMessage = useRegenerateMessage();
  const { emptySubmit, reload, deleteMessagesAfter } = useChatContext();
  const { temporaryChat } = useModelStore();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(message.content);

  async function handleRegenerateMessage() {
    await regenerateMessage.mutateAsync({
      messageId: message.id,
      conversationId,
      temporaryChat,
    });

    if (temporaryChat) {
      deleteMessagesAfter(message.id);
      reload();
    } else {
      emptySubmit();
    }
  }

  async function handleEditMessage() {
    setIsEditing(true);
  }

  async function handleSaveMessage() {
    await regenerateMessage.mutateAsync({
      messageId: message.id,
      conversationId,
      temporaryChat,
      newContent: content,
    });
    setIsEditing(false);

    if (temporaryChat) {
      deleteMessagesAfter(message.id, content);
      reload();
    } else {
      emptySubmit();
    }
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setContent(message.content);
  }

  useEffect(() => {
    if (isEditing) {
      const textarea = document.getElementById("edit-message");
      if (textarea) {
        textarea.focus();
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
            >
              <X size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 p-0"
              onClick={handleSaveMessage}
            >
              <Check size={18} />
            </Button>
          </>
        )}
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
                onClick={() => navigator.clipboard.writeText(message.content)}
              >
                <Copy
                  size={18}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>Copy message</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
              >
                <RefreshCw
                  size={18}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>Regenerate response</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
