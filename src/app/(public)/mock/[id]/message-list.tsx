"use client";

import { useChat } from "@ai-sdk/react";
import { CheckIcon, GlobeIcon, MessageSquare } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
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
import { useUpdateConversationModel } from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import type { CustomUIMessage } from "@/types/chat";

export default function MockMessageList({
  id,
  initialModel,
  initialMessages,
}: {
  id: string;
  initialModel: string | undefined;
  initialMessages: CustomUIMessage[];
}) {
  const models = useModelStore((state) => state.availableModels);
  const providers = useModelStore((state) => state.providers);
  const model = useModelStore((state) => state.model);
  const setModel = useModelStore((state) => state.setModel);
  const updateModel = useUpdateConversationModel();
  const modelProvider = providers.find((p) => p.models.some((m) => m.id === model.id));
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const selectedModelData = models.find((m) => m.id === model.id);
  const [browse, setBrowse] = useState(false);
  const { messages, sendMessage, status, stop } = useChat<CustomUIMessage>({
    id,
    messages: initialMessages,
  });

  const handleStop = () => {
    if (status === "streaming") {
      stop();
    }
  };

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage(message, {
      body: {
        id,
        model: model.id,
        temporaryChat: false,
        browse,
      },
    });
  };

  useEffect(() => {
    if (initialModel) {
      setModel(initialModel);
    }
  }, [initialModel, setModel]);

  const streamingMessages = useMemo(() => {
    const persistedIds = new Set(initialMessages.map((m) => m.id));
    return messages.filter((msg) => !persistedIds.has(msg.id));
  }, [messages, initialMessages]);

  const existingMessagesList = useMemo(
    () =>
      initialMessages.map((message) => (
        <MessageItem key={message.id} message={message} conversationId={id} />
      )),
    [initialMessages, id]
  );

  const streamingMessagesList = useMemo(
    () =>
      streamingMessages.map((message) => (
        <MessageItem key={message.id} message={message} conversationId={id} />
      )),
    [streamingMessages, id]
  );

  return (
    <div className="flex h-full flex-col gap-4 py-4">
      <Conversation>
        <ConversationContent className="p-4">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquare className="size-12" />}
              title="Start a conversation"
              description="Type a message below to begin chatting"
            />
          ) : (
            <Fragment>
              {existingMessagesList}
              {streamingMessagesList}
            </Fragment>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInputProvider>
        <PromptInput globalDrop multiple onSubmit={handleSubmit} className="px-4">
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputBody>
            <PromptInputTextarea />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
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
                            onSelect={() => {
                              setModel(m.id);
                              updateModel.mutateAsync({
                                conversationId: id,
                                model: m.id,
                              });
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
            </PromptInputTools>
            <PromptInputSubmit status={status} onClick={handleStop} />
          </PromptInputFooter>
        </PromptInput>
      </PromptInputProvider>
    </div>
  );
}
