"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckIcon, LockIcon } from "lucide-react";
import { type ChangeEvent, useCallback, useContext, useMemo, useState } from "react";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorCost,
  ModelSelectorEmpty,
  ModelSelectorFeatures,
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
import ChatSettingsMenu from "@/components/chat/chat-settings-menu";
import { SkillSlashMenu } from "@/components/chat/skill-slash-menu";
import { useSession } from "@/lib/auth-client";
import { AuthContext } from "@/lib/contexts/auth-context";
import { useChatInput, useChatInputStatus } from "@/lib/contexts/chat-input-context";
import { isModelGated } from "@/lib/model-gating";
import { useTRPC } from "@/lib/trpc/client";
import { debounce, INPUT_STORAGE_KEY } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import { useUIStore } from "@/stores/ui-store";

function getPersistedInput() {
  if (typeof localStorage === "undefined") return "";
  return localStorage.getItem(INPUT_STORAGE_KEY) || "";
}

const persistInput = debounce((input: string) => {
  localStorage.setItem(INPUT_STORAGE_KEY, input);
}, 1000);

export default function ChatInput() {
  const { handlersRef } = useChatInput();
  const { status, areFilesUploading, deepResearch, hasPendingResearch } =
    useChatInputStatus();
  const modelSelectorLocked = deepResearch || hasPendingResearch;
  const { data: session } = useSession();
  const { setDialogOpen } = useContext(AuthContext);
  const providers = useModelStore((state) => state.providers);
  const model = useModelStore((state) => state.model);
  const setModel = useModelStore((state) => state.setModel);
  const modelProvider = useMemo(
    () => providers.find((p) => p.models.some((m) => m.id === model?.id)),
    [providers, model?.id]
  );
  const modelSelectorOpen = useUIStore((state) => state.modelMenuOpen);
  const setModelSelectorOpen = useUIStore((state) => state.setModelMenuOpen);
  const models = useModelStore((state) => state.availableModels);
  const selectedModelData = useMemo(
    () => models.find((m) => m.id === model?.id),
    [models, model?.id]
  );
  const [initialInput] = useState(getPersistedInput);

  const effortLevels = selectedModelData?.effortLevels;
  const supportsReasoning = (effortLevels?.length ?? 0) > 0;
  const supportsTools = selectedModelData?.tools ?? false;
  const maxCost = useMemo(
    () => Math.max(1, ...providers.flatMap((p) => p.models).map((m) => m.cost)),
    [providers]
  );

  const trpc = useTRPC();
  const { data: featureFlags } = useQuery(
    trpc.userFeatureFlags.queryOptions(undefined, { meta: { persist: false } })
  );
  const skillsEnabled = featureFlags?.skillsEnabled ?? false;
  const modelMaxCost = featureFlags?.modelMaxCost ?? null;

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    persistInput(e.currentTarget.value);
  }, []);

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (!session) {
        setDialogOpen(true);
        return;
      }
      persistInput.cancel();
      localStorage.removeItem(INPUT_STORAGE_KEY);
      return handlersRef.current.onSubmit(message);
    },
    [handlersRef, session, setDialogOpen]
  );

  const handleStop = useCallback(() => {
    handlersRef.current.onStop?.();
  }, [handlersRef]);

  const handleCancelResearch = useCallback(() => {
    handlersRef.current.onCancelResearch?.();
  }, [handlersRef]);

  const handleModelSelect = useCallback(
    (modelId: string) => {
      const target = models.find((m) => m.id === modelId);
      if (target && isModelGated(target.cost, modelMaxCost)) return;
      setModel(modelId);
      handlersRef.current.onModelChange?.("", modelId);
      setModelSelectorOpen(false);
    },
    [setModel, handlersRef, setModelSelectorOpen, models, modelMaxCost]
  );

  return (
    <PromptInputProvider initialInput={initialInput}>
      <ChatLayoutWrapper className="bg-background">
        <SkillSlashMenu skillsEnabled={skillsEnabled} supportsTools={supportsTools}>
          <PromptInput
            globalDrop
            multiple
            blocked={["streaming", "submitted"].includes(status) || hasPendingResearch}
            onSubmit={handleSubmit}
            accept={model?.extensions?.join(",")}
            maxFileSize={1024 * 1024 * 20}
          >
            <PromptInputAttachments>
              {(attachment) => (
                <PromptInputAttachment
                  data={attachment}
                  isUploading={areFilesUploading}
                />
              )}
            </PromptInputAttachments>
            <PromptInputBody>
              <PromptInputTextarea
                placeholder={
                  hasPendingResearch
                    ? "Research is running. You can chat again once it finishes…"
                    : "Type a message to start..."
                }
                disabled={hasPendingResearch}
                onChange={handleInputChange}
                className="wrap-anywhere"
              />
            </PromptInputBody>
            <PromptInputFooter className="space-x-1">
              <PromptInputTools className="flex w-full items-center">
                <ChatSettingsMenu
                  supportsAttachments={0 < (model.extensions?.length || 0)}
                  supportsReasoning={supportsReasoning}
                  effortLevels={effortLevels}
                />
                <ModelSelector
                  onOpenChange={modelSelectorLocked ? undefined : setModelSelectorOpen}
                  open={modelSelectorLocked ? false : modelSelectorOpen}
                >
                  <ModelSelectorTrigger asChild>
                    <PromptInputButton
                      disabled={modelSelectorLocked}
                      title={
                        modelSelectorLocked
                          ? "Model is locked while deep research is selected"
                          : undefined
                      }
                    >
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
                          {provider.models.map((providerModel) => {
                            const gated = isModelGated(providerModel.cost, modelMaxCost);
                            return (
                              <ModelSelectorItem
                                key={providerModel.id}
                                disabled={gated}
                                onSelect={() => handleModelSelect(providerModel.id)}
                                value={providerModel.id}
                                title={
                                  gated
                                    ? "Upgrade your plan to use this model"
                                    : undefined
                                }
                              >
                                <ModelSelectorLogo provider={provider.id} />
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                  <span className="min-w-0 truncate text-left text-sm">
                                    {providerModel.name}
                                  </span>
                                  <ModelSelectorCost
                                    cost={providerModel.cost}
                                    maxCost={maxCost}
                                  />
                                </div>
                                <ModelSelectorFeatures
                                  features={providerModel.features}
                                />
                                {gated ? (
                                  <LockIcon className="ml-auto size-4 text-muted-foreground" />
                                ) : model?.id === providerModel.id ? (
                                  <CheckIcon className="ml-auto size-4" />
                                ) : (
                                  <div className="ml-auto size-4" />
                                )}
                              </ModelSelectorItem>
                            );
                          })}
                        </ModelSelectorGroup>
                      ))}
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </PromptInputTools>
              <PromptInputSubmit
                status={hasPendingResearch ? "streaming" : status}
                onClick={hasPendingResearch ? handleCancelResearch : handleStop}
              />
            </PromptInputFooter>
          </PromptInput>
        </SkillSlashMenu>
      </ChatLayoutWrapper>
    </PromptInputProvider>
  );
}
