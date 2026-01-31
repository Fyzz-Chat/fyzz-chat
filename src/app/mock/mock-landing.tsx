"use client";

import { CheckIcon, GlobeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
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
import { useInitialMessage } from "@/lib/contexts/initial-message-context";
import { cn } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";

export default function MockLanding() {
  const router = useRouter();
  const { setInitialMessage, setInitialModel, setInitialBrowse, setInitialFiles } =
    useInitialMessage();
  const models = useModelStore((state) => state.availableModels);
  const providers = useModelStore((state) => state.providers);
  const model = useModelStore((state) => state.model);
  const setModel = useModelStore((state) => state.setModel);
  const modelProvider = providers.find((p) => p.models.some((m) => m.id === model.id));
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const selectedModelData = models.find((m) => m.id === model.id);
  const [browse, setBrowse] = useState(false);

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text) return;

    const id = uuidv4();
    setInitialMessage(message.text);
    setInitialModel(model.id);
    setInitialBrowse(browse);
    setInitialFiles(message.files || []);
    router.push(`/mock/${id}`);
  };

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <PromptInputProvider>
          <PromptInput
            globalDrop
            multiple
            onSubmit={handleSubmit}
            accept={model?.extensions?.join(",")}
          >
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
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
                <ModelSelector
                  onOpenChange={setModelSelectorOpen}
                  open={modelSelectorOpen}
                >
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
                              onSelect={() => {
                                setModel(m.id);
                                setModelSelectorOpen(false);
                              }}
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
              <PromptInputSubmit />
            </PromptInputFooter>
          </PromptInput>
        </PromptInputProvider>
      </div>
    </div>
  );
}
