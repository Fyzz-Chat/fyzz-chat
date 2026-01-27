"use client";

import type { FileUIPart, ToolUIPart } from "ai";
import { CheckIcon, CopyIcon, EditIcon, RefreshCwIcon, XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAttachment,
  MessageAttachments,
  MessageContent,
  MessageResponse,
  MessageToolbar,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  OpenAICodeInterpreterOutput,
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import ImageFilePart from "@/components/message/parts/image-file-part";
import { useRegenerateMessage } from "@/lib/queries/conversations";
import { getMessageContent } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import { useModelStore } from "@/stores/model-store";
import type { CustomUIMessage } from "@/types/chat";
import { pdfType } from "@/types/provider";
import type { CodeInterpreterOutput, ImageGenerationOutput } from "@/types/tools";

export function MessageItemNew({
  message,
  conversationId,
}: {
  message: CustomUIMessage;
  conversationId: string;
}) {
  const regenerateMessage = useRegenerateMessage();
  const [inProgress, setInProgress] = useState(false);
  const temporaryChat = useModelStore((state) => state.temporaryChat);
  const status = useChatStore((state) => state.status);
  const model = useModelStore((state) =>
    state.getModel(message.metadata?.model || state.model?.id)
  );
  const attachments: FileUIPart[] = useMemo(() => {
    return message.parts.filter((part): part is FileUIPart => part.type === "file");
  }, [message.parts]);
  let reasoningIndex = 0;
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(getMessageContent(message));
  const [isCopied, setIsCopied] = useState(false);

  async function handleRegenerateMessage(messageId: string) {
    setInProgress(true);
    await regenerateMessage.mutateAsync({
      messageId,
      conversationId,
      temporaryChat,
    });

    if (temporaryChat) {
      const { regenerate } = useChatStore.getState();
      regenerate(messageId);
    } else {
      const { emptySubmit } = useChatStore.getState();
      emptySubmit();
    }
    setInProgress(false);
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
      await navigator.clipboard.writeText(getMessageContent(message));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: Dependencies are correct as is
  useEffect(() => {
    if (!isEditing) return;

    const textarea = document.getElementById("edit-message") as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancelEdit();
      }
    };
    globalThis.addEventListener("keydown", handleEscape);

    return () => {
      globalThis.removeEventListener("keydown", handleEscape);
    };
  }, [isEditing]);

  return (
    <Message from={message.role}>
      {attachments.length > 0 && message.role === "user" && (
        <MessageAttachments>
          {attachments
            .filter(
              (attachment) =>
                attachment.mediaType?.startsWith("image/") ||
                attachment.mediaType?.startsWith(pdfType)
            )
            .map((attachment) => (
              <MessageAttachment key={attachment.url} data={attachment} />
            ))}
        </MessageAttachments>
      )}
      {isEditing ? (
        <MessageContent>
          <TextareaAutosize
            id="edit-message"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex max-h-80 w-full resize-none rounded-lg focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
          />
        </MessageContent>
      ) : (
        message.parts.map((part, i) => {
          switch (part.type) {
            case "text": {
              return (
                <MessageContent key={`${message.id}-${i}`}>
                  <MessageResponse
                    mode={status === "streaming" ? "streaming" : "static"}
                    isAnimating={status === "streaming"}
                  >
                    {part.text}
                  </MessageResponse>
                </MessageContent>
              );
            }
            case "file": {
              if (part.mediaType?.startsWith("image/") && message.role === "assistant") {
                return (
                  <ImageFilePart
                    key={`${message.id}-file-${i}`}
                    url={part.url}
                    name={part.filename}
                    mediaType={part.mediaType}
                  />
                );
              }
              return null;
            }
            case "tool-memory": {
              return (
                <Tool key={`${message.id}-tool-memory-${i}`}>
                  <ToolHeader type="tool-memory" state={part.state} />
                  <ToolContent>
                    <ToolInput input={part.input} />
                    <ToolOutput output={""} errorText={part.errorText} />
                  </ToolContent>
                </Tool>
              );
            }
            case "tool-readUrl": {
              return (
                <Tool key={`${message.id}-tool-readUrl-${i}`}>
                  <ToolHeader type="tool-readUrl" state={part.state} />
                  <ToolContent>
                    <ToolInput input={part.input} />
                    <ToolOutput output={""} errorText={part.errorText} />
                  </ToolContent>
                </Tool>
              );
            }
            case "tool-code_interpreter": {
              return (
                <Tool key={`${message.id}-tool-code_interpreter-${i}`}>
                  <ToolHeader type="tool-code_interpreter" state={part.state} />
                  <ToolContent>
                    <ToolInput input={part.input} />
                    <OpenAICodeInterpreterOutput
                      output={part.output as CodeInterpreterOutput}
                      errorText={part.errorText}
                    />
                  </ToolContent>
                </Tool>
              );
            }
            case "dynamic-tool": {
              return (
                <Tool key={`${message.id}-${part.toolName}-${i}`}>
                  <ToolHeader
                    type={part.toolName as ToolUIPart["type"]}
                    state={part.state}
                  />
                  <ToolContent>
                    <ToolInput input={part.input} />
                  </ToolContent>
                </Tool>
              );
            }
            case "tool-image_generation": {
              const output = part.output as ImageGenerationOutput;
              return (
                <Tool open key={`${message.id}-tool-image_generation-${i}`}>
                  <ToolHeader type="tool-image_generation" state={part.state} />
                  <ToolContent>
                    <ImageFilePart url={`data:image/png;base64,${output?.result}`} />
                  </ToolContent>
                </Tool>
              );
            }
            case "reasoning": {
              return (
                (status === "streaming" || part.text) && (
                  <Reasoning
                    key={`${message.id}-reasoning-${i}`}
                    isStreaming={status === "streaming"}
                  >
                    <ReasoningTrigger
                      duration={
                        message.metadata?.reasoningDurations?.[reasoningIndex++]?.ms
                      }
                    />
                    <ReasoningContent>{part.text}</ReasoningContent>
                  </Reasoning>
                )
              );
            }
            default: {
              return null;
            }
          }
        })
      )}
      {message.role === "user" && isEditing && (
        <MessageToolbar className="flex-row-reverse">
          <MessageActions>
            <MessageAction
              onClick={handleCancelEdit}
              label="Cancel"
              tooltip="Cancel editing"
              disabled={inProgress}
            >
              <XIcon className="size-3" />
            </MessageAction>
            <MessageAction
              onClick={handleSaveMessage}
              label="Save"
              tooltip="Save changes"
              disabled={inProgress}
            >
              <CheckIcon className="size-3" />
            </MessageAction>
          </MessageActions>
        </MessageToolbar>
      )}
      {message.role === "user" && !isEditing && (
        <MessageToolbar className="flex-row-reverse">
          <MessageActions>
            <MessageAction
              onClick={() => setIsEditing(true)}
              label="Edit"
              tooltip="Edit message"
            >
              <EditIcon className="size-3" />
            </MessageAction>
            <MessageAction
              onClick={handleCopy}
              label={isCopied ? "Copied" : "Copy"}
              tooltip="Copy message"
            >
              {isCopied ? (
                <CheckIcon className="size-3" />
              ) : (
                <CopyIcon className="size-3" />
              )}
            </MessageAction>
          </MessageActions>
        </MessageToolbar>
      )}
      {message.role === "assistant" && (
        <MessageToolbar>
          <MessageActions>
            <MessageAction
              onClick={handleCopy}
              label={isCopied ? "Copied" : "Copy"}
              tooltip="Copy message"
            >
              {isCopied ? (
                <CheckIcon className="size-3" />
              ) : (
                <CopyIcon className="size-3" />
              )}
            </MessageAction>
            <MessageAction
              onClick={() => handleRegenerateMessage(message.id)}
              label="Regenerate"
              tooltip="Regenerate response"
              disabled={inProgress}
            >
              <RefreshCwIcon className="size-3" />
            </MessageAction>
          </MessageActions>
          <p className="mr-auto text-muted-foreground text-xs">{model?.name}</p>
        </MessageToolbar>
      )}
    </Message>
  );
}
