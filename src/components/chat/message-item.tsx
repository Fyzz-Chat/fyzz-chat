"use client";

import type { FileUIPart, SourceUrlUIPart, ToolUIPart } from "ai";
import { Check, Pencil, X } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  SkillToolHeader,
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import MessageBranchAction from "@/components/chat/message-branch-action";
import MessageCopyAction from "@/components/chat/message-copy-action";
import MessageRegenerateAction from "@/components/chat/message-regenerate-action";
import MessageShareAction from "@/components/chat/message-share-action";
import ImageFilePart from "@/components/message/parts/image-file-part";
import { useModelStore } from "@/stores/model-store";
import type { CustomUIMessage, ShareInfo } from "@/types/chat";
import type { CodeInterpreterOutput, ImageGenerationOutput } from "@/types/tools";

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-1">
      <div className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
      <div className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
      <div className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
    </div>
  );
}

function MessageItem({
  message,
  conversationId,
  share,
  isStreaming = false,
  onRegenerate,
  onEdit,
}: Readonly<{
  message: CustomUIMessage;
  conversationId: string;
  share?: ShareInfo;
  isStreaming?: boolean;
  onRegenerate?: (messageId: string) => Promise<void>;
  onEdit?: (messageId: string, newContent: string) => Promise<void>;
}>) {
  const model = useModelStore((state) => state.getModel(message.metadata?.model));
  const renderCount = useRef(0);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  renderCount.current += 1;

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const attachments: FileUIPart[] = useMemo(() => {
    return message.parts.filter((part): part is FileUIPart => part.type === "file");
  }, [message.parts]);
  const sourceUrls: SourceUrlUIPart[] = useMemo(() => {
    return message.parts.filter(
      (part): part is SourceUrlUIPart => part.type === "source-url"
    );
  }, [message.parts]);

  const textContent = useMemo(() => {
    const textPart = message.parts.find((part) => part.type === "text");
    return textPart?.type === "text" ? textPart.text : "";
  }, [message.parts]);

  const handleStartEdit = useCallback(() => {
    setEditedContent(textContent);
    setIsEditing(true);
  }, [textContent]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedContent("");
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!onEdit || !editedContent.trim() || editedContent === textContent) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onEdit(message.id, editedContent);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }, [onEdit, editedContent, textContent, message.id]);

  useEffect(() => {
    if (!isEditing) return;

    const textarea = editTextareaRef.current;
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
  }, [isEditing, handleCancelEdit]);

  let reasoningIndex = 0;

  return (
    <Message from={message.role} key={message.id}>
      {attachments.length > 0 && message.role === "user" && (
        <MessageAttachments>
          {attachments.map((attachment) => (
            <MessageAttachment key={attachment.url} data={attachment} />
          ))}
        </MessageAttachments>
      )}
      {isStreaming && message.parts.length < 2 && message.role === "assistant" && (
        <TypingIndicator />
      )}
      {message.parts.map((part, i) => {
        switch (part.type) {
          case "text": {
            if (isEditing && message.role === "user") {
              return (
                <MessageContent
                  key={`${message.id}-${i}`}
                  className="min-w-[calc(max(70%,300px))] p-0!"
                >
                  <textarea
                    ref={editTextareaRef}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="field-sizing-content max-h-96 w-full resize-none rounded-md bg-secondary px-4 py-3 text-sm focus-visible:outline-hidden"
                  />
                </MessageContent>
              );
            }
            return (
              <MessageContent key={`${message.id}-${i}`}>
                <MessageResponse
                  mode={isStreaming ? "streaming" : "static"}
                  isAnimating={isStreaming}
                  sources={sourceUrls}
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
          case "tool-activate_skill": {
            const output = part.output as
              | { success?: boolean; name?: string; content?: string; error?: string }
              | undefined;
            const input = part.input as { id?: string } | undefined;
            const body =
              output?.success && output.content ? (
                <pre className="whitespace-pre-wrap rounded-md bg-muted px-3 py-2 text-xs">
                  {output.content}
                </pre>
              ) : (
                ""
              );
            return (
              <Tool key={`${message.id}-tool-activate_skill-${i}`}>
                <SkillToolHeader
                  state={part.state}
                  skillName={output?.name}
                  skillId={input?.id}
                />
                <ToolContent>
                  <ToolInput input={part.input} />
                  <ToolOutput output={body} errorText={part.errorText ?? output?.error} />
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
          case "tool-web_search": {
            return (
              <Tool key={`${message.id}-tool-search_web-${i}`}>
                <ToolHeader type="tool-search_web" state={part.state} />
                <ToolContent>
                  <ToolInput input={part.input} />
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
                  {output?.result && (
                    <ImageFilePart url={`data:image/png;base64,${output?.result}`} />
                  )}
                </ToolContent>
              </Tool>
            );
          }
          case "reasoning": {
            return (
              (isStreaming || part.text) && (
                <Reasoning key={`${message.id}-reasoning-${i}`} isStreaming={isStreaming}>
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
      })}
      {!isStreaming && message.role === "assistant" && (
        <MessageToolbar>
          <MessageActions>
            <MessageCopyAction message={message} />
            <MessageRegenerateAction messageId={message.id} onRegenerate={onRegenerate} />
            <MessageShareAction
              conversationId={conversationId}
              messageId={message.id}
              share={share}
            />
            <MessageBranchAction conversationId={conversationId} messageId={message.id} />
          </MessageActions>
          <p className="mr-auto text-muted-foreground text-xs">{model?.name}</p>
        </MessageToolbar>
      )}
      {!isStreaming && message.role === "user" && (
        <MessageToolbar className="flex-row-reverse">
          <MessageActions>
            {isEditing ? (
              <>
                <MessageAction
                  label="Save"
                  tooltip="Save changes"
                  onClick={handleSaveEdit}
                  disabled={isSaving || !editedContent.trim()}
                >
                  <Check className="size-4" />
                </MessageAction>
                <MessageAction
                  label="Cancel"
                  tooltip="Cancel editing"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X className="size-4" />
                </MessageAction>
              </>
            ) : (
              <>
                <MessageAction
                  label="Edit"
                  tooltip="Edit message"
                  onClick={handleStartEdit}
                >
                  <Pencil className="size-4" />
                </MessageAction>
                <MessageCopyAction message={message} />
              </>
            )}
          </MessageActions>
        </MessageToolbar>
      )}
    </Message>
  );
}

export default memo(MessageItem);
