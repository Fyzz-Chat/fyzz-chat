"use client";

import { useChat } from "@ai-sdk/react";
import { CheckIcon, GlobeIcon, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import MessageItem from "@/app/(public)/mock/[id]/message-item";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
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
import { cn } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import type { CustomUIMessage } from "@/types/chat";

export default function MockMessageList({ id }: { id: string }) {
  const models = useModelStore((state) => state.availableModels);
  const providers = useModelStore((state) => state.providers);
  const [model, setModel] = useState<string | undefined>(undefined);
  const modelProvider = providers.find((p) => p.models.some((m) => m.id === model));
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const selectedModelData = models.find((m) => m.id === model);
  const [input, setInput] = useState("");
  const [browse, setBrowse] = useState(false);
  const { messages, sendMessage, status } = useChat<CustomUIMessage>({ id });

  useEffect(() => {
    if (models.length > 0) {
      setModel(models[0].id);
    }
  }, [models]);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage(message, {
      body: {
        id,
        model,
        temporaryChat: false,
        browse,
      },
    });
    setInput("");
  };

  const messagesList = useMemo(
    () => messages.map((message) => <MessageItem key={message.id} message={message} />),
    [messages]
  );

  return (
    <div className="relative flex flex-1 justify-center">
      <div className="flex h-full flex-1 flex-col">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquare className="size-12" />}
                title="Start a conversation"
                description="Type a message below to begin chatting"
              />
            ) : (
              messagesList
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInputProvider>
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputBody>
              <PromptInputTextarea
                value={input}
                placeholder="Say something..."
                onChange={(e) => setInput(e.currentTarget.value)}
                className="pr-12"
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <PromptInputButton onClick={() => setBrowse(!browse)}>
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
                              {/* <ModelSelectorLogoGroup>
                                {model.features.map((feature) => (
                                  <ModelSelectorLogo key={provider} provider={provider} />
                                ))}
                              </ModelSelectorLogoGroup> */}
                              {model === m.id ? (
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
              </PromptInputTools>
              <PromptInputSubmit
                status={status === "streaming" ? "streaming" : "ready"}
                disabled={!input.trim() && status === "ready"}
                className="absolute right-1 bottom-1"
              />
            </PromptInputFooter>
          </PromptInput>
        </PromptInputProvider>
      </div>
    </div>
  );
}
