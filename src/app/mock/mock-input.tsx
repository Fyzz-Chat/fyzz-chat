"use client";

import { CheckIcon, GlobeIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
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
import { useMockInput, useMockInputStatus } from "@/lib/contexts/mock-input-context";
import { cn } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";

export default function MockInput() {
  const { handlersRef, browseRef } = useMockInput();
  const { status, areFilesUploading } = useMockInputStatus();
  const providers = useModelStore((state) => state.providers);
  const model = useModelStore((state) => state.model);
  const setModel = useModelStore((state) => state.setModel);
  const modelProvider = useMemo(
    () => providers.find((p) => p.models.some((m) => m.id === model.id)),
    [providers, model.id]
  );
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const models = useModelStore((state) => state.availableModels);
  const selectedModelData = useMemo(
    () => models.find((m) => m.id === model.id),
    [models, model.id]
  );
  const [browse, _setBrowse] = useState(false);
  const setBrowse = useCallback(
    (value: boolean) => {
      _setBrowse(value);
      browseRef.current = value;
    },
    [browseRef]
  );

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      handlersRef.current.onSubmit(message);
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
    [setModel, handlersRef]
  );

  return (
    <PromptInputProvider>
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
            <PromptInputTextarea placeholder="Type a message to start..." />
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
