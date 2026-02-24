"use client";

import { CheckIcon, GlobeIcon } from "lucide-react";
import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { ChatLayoutWrapper } from "@/components/chat/chat-layout-wrapper";
import { useChatInput, useChatInputStatus } from "@/lib/contexts/chat-input-context";
import { cn, debounce } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import { useUIStore } from "@/stores/ui-store";

const INPUT_STORAGE_KEY = "fyzz-input-content";

function getPersistedInput() {
  if (typeof localStorage === "undefined") return "";
  return localStorage.getItem(INPUT_STORAGE_KEY) || "";
}

const persistInput = debounce((input: string) => {
  localStorage.setItem(INPUT_STORAGE_KEY, input);
}, 1000);

export default function ChatInput() {
  const { handlersRef, browseRef } = useChatInput();
  const { status, areFilesUploading } = useChatInputStatus();
  const providers = useModelStore((state) => state.providers);
  const model = useModelStore((state) => state.model);
  const setModel = useModelStore((state) => state.setModel);
  const modelProvider = useMemo(
    () => providers.find((p) => p.models.some((m) => m.id === model.id)),
    [providers, model.id]
  );
  const modelSelectorOpen = useUIStore((state) => state.modelMenuOpen);
  const setModelSelectorOpen = useUIStore((state) => state.setModelMenuOpen);
  const models = useModelStore((state) => state.availableModels);
  const selectedModelData = useMemo(
    () => models.find((m) => m.id === model.id),
    [models, model.id]
  );
  const [initialInput] = useState(getPersistedInput);
  const [browse, _setBrowse] = useState(false);
  const setBrowse = useCallback(
    (value: boolean) => {
      _setBrowse(value);
      browseRef.current = value;
    },
    [browseRef]
  );

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    persistInput(e.currentTarget.value);
  }, []);

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      localStorage.removeItem(INPUT_STORAGE_KEY);
      return handlersRef.current.onSubmit(message);
    },
    [handlersRef]
  );

  const handleStop = useCallback(() => {
    handlersRef.current.onStop?.();
  }, [handlersRef]);

  const handleModelSelect = useCallback(
    (modelId: string) => {
      setModel(modelId);
      handlersRef.current.onModelChange?.("", modelId);
      setModelSelectorOpen(false);
    },
    [setModel, handlersRef, setModelSelectorOpen]
  );

  return (
    <PromptInputProvider initialInput={initialInput}>
      <ChatLayoutWrapper className="bg-background">
        <PromptInput
          globalDrop
          multiple
          blocked={["streaming", "submitted"].includes(status)}
          onSubmit={handleSubmit}
          accept={model?.extensions?.join(",")}
          maxFileSize={1024 * 1024 * 20}
          className="md:px-4"
        >
          <PromptInputAttachments>
            {(attachment) => (
              <PromptInputAttachment data={attachment} isUploading={areFilesUploading} />
            )}
          </PromptInputAttachments>
          <PromptInputBody>
            <PromptInputTextarea
              placeholder="Type a message to start..."
              onChange={handleInputChange}
            />
          </PromptInputBody>
          <PromptInputFooter className="space-x-1">
            <PromptInputTools className="flex w-full items-center">
              <PromptInputButton
                onClick={() => setBrowse(!browse)}
                className="rounded-full"
              >
                <GlobeIcon size={16} className={cn(browse && "text-primary")} />
                <span className={cn(browse && "text-primary")}>Search</span>
              </PromptInputButton>
              <ModelSelector onOpenChange={setModelSelectorOpen} open={modelSelectorOpen}>
                <ModelSelectorTrigger asChild>
                  <PromptInputButton>
                    {modelProvider?.id && (
                      <ModelSelectorLogo provider={modelProvider.id} />
                    )}
                    {selectedModelData?.name && (
                      <ModelSelectorName>{selectedModelData.name}</ModelSelectorName>
                    )}
                  </PromptInputButton>
                </ModelSelectorTrigger>
                <ModelSelectorContent>
                  <ModelSelectorInput placeholder="Search models..." />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                    {providers.map((provider) => (
                      <ModelSelectorGroup heading={provider.name} key={provider.id}>
                        {provider.models.map((m) => (
                          <ModelSelectorItem
                            key={m.id}
                            onSelect={() => handleModelSelect(m.id)}
                            value={m.id}
                          >
                            <ModelSelectorLogo provider={provider.id} />
                            <ModelSelectorName>{m.name}</ModelSelectorName>
                            {model.id === m.id ? (
                              <CheckIcon className="ml-auto size-4" />
                            ) : (
                              <div className="ml-auto size-4" />
                            )}
                          </ModelSelectorItem>
                        ))}
                      </ModelSelectorGroup>
                    ))}
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>
              {model.extensions?.length > 0 && (
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger className="ml-auto" />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
              )}
            </PromptInputTools>
            <PromptInputSubmit status={status} onClick={handleStop} />
          </PromptInputFooter>
        </PromptInput>
      </ChatLayoutWrapper>
    </PromptInputProvider>
  );
}
