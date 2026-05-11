// biome-ignore-all lint/suspicious/noArrayIndexKey: message parts are append-only during streaming and never reorder; index identity matches the useChat per-token re-render contract that this file is built around (see CLAUDE.md).

"use client";

import type { FileUIPart, SourceUrlUIPart, ToolUIPart } from "ai";
import { AlertCircleIcon, Check, MicroscopeIcon, Pencil, X } from "lucide-react";
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
  MemoryToolHeader,
  OpenAICodeInterpreterOutput,
  SearchToolHeader,
  SkillToolHeader,
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import MessageBranchAction from "@/components/chat/message-branch-action";
import MessageCopyAction from "@/components/chat/message-copy-action";
import MessageRating from "@/components/chat/message-rating";
import MessageRegenerateAction from "@/components/chat/message-regenerate-action";
import MessageShareAction from "@/components/chat/message-share-action";
import { MessageSources } from "@/components/chat/message-sources";
import ImageFilePart from "@/components/message/parts/image-file-part";
import { useResearchPolling } from "@/lib/queries/research";
import { cn } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import type { CustomUIMessage } from "@/types/chat";
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
  isStreaming = false,
  onRegenerate,
  onEdit,
}: Readonly<{
  message: CustomUIMessage;
  conversationId: string;
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

  const messageStatus = message.metadata?.status;
  const isResearchPending = messageStatus === "pending" && message.role === "assistant";
  const isResearchFailed = messageStatus === "failed" && message.role === "assistant";

  useResearchPolling({
    messageId: message.id,
    conversationId,
    enabled: isResearchPending,
  });

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

  const handleSaveEdit = useCallback(() => {
    if (!onEdit || !editedContent.trim() || editedContent === textContent) {
      setIsEditing(false);
      return;
    }

    // Close the editor immediately; `onEdit` resolves only when the model finishes streaming.
    const contentToSubmit = editedContent;
    setIsEditing(false);
    setEditedContent("");
    void onEdit(message.id, contentToSubmit);
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

  if (isResearchPending) {
    return (
      <Message from="assistant" key={message.id}>
        <MessageContent>
          <div className="flex items-center gap-3">
            <MicroscopeIcon className="size-4 shrink-0 text-(--theme-blue)" />
            <span className="text-muted-foreground text-sm">
              Researching… this usually takes 5–15 minutes.
            </span>
            <TypingIndicator />
          </div>
        </MessageContent>
      </Message>
    );
  }

  if (isResearchFailed) {
    return (
      <Message from="assistant" key={message.id}>
        <MessageContent>
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircleIcon className="size-4 shrink-0" />
            <span className="text-sm">
              Research failed: {message.metadata?.failedReason || "Unknown error"}
            </span>
          </div>
        </MessageContent>
      </Message>
    );
  }

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
          case "tool-store_fact":
          case "tool-store_opinion":
          case "tool-store_learning":
          case "tool-store_feedback":
          case "tool-update_opinion":
          case "tool-delete_memory": {
            const memoryOutput =
              typeof part.output === "string" ? part.output : undefined;
            return (
              <Tool key={`${message.id}-${part.type}-${i}`}>
                <MemoryToolHeader
                  type={part.type}
                  state={part.state}
                  output={part.output}
                />
                <ToolContent>
                  <ToolInput input={part.input} />
                  <ToolOutput output={memoryOutput ?? ""} errorText={part.errorText} />
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
          case "tool-web_search":
          case "tool-x_search": {
            const searchOutput = "output" in part ? part.output : undefined;
            const providerExecuted =
              "providerExecuted" in part ? part.providerExecuted : undefined;
            return (
              <Tool key={`${message.id}-${part.type}-${i}`}>
                <SearchToolHeader
                  state={part.state}
                  input={part.input}
                  output={searchOutput}
                  providerExecuted={providerExecuted}
                />
                <ToolContent>
                  <ToolInput input={part.input} output={searchOutput} />
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
      {message.role === "assistant" && sourceUrls.length > 0 && (
        <MessageSources sources={sourceUrls} />
      )}
      {message.role === "assistant" && (
        <MessageToolbar
          className={cn(isStreaming && "pointer-events-none invisible")}
          aria-hidden={isStreaming || undefined}
        >
          <MessageActions>
            <MessageCopyAction message={message} />
            <MessageRegenerateAction messageId={message.id} onRegenerate={onRegenerate} />
            <MessageShareAction conversationId={conversationId} messageId={message.id} />
            <MessageBranchAction conversationId={conversationId} messageId={message.id} />
            <MessageRating conversationId={conversationId} messageId={message.id} />
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
                  disabled={!editedContent.trim()}
                >
                  <Check className="size-4" />
                </MessageAction>
                <MessageAction
                  label="Cancel"
                  tooltip="Cancel editing"
                  onClick={handleCancelEdit}
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
