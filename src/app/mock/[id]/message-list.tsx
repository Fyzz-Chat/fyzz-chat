"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { CheckIcon, GlobeIcon, MessageSquare } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import MessageItem from "@/app/mock/[id]/message-item";
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
import { ChatLayoutWrapper } from "@/components/chat/chat-layout-wrapper";
import { useInitialMessage } from "@/lib/contexts/initial-message-context";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const models = useModelStore((state) => state.availableModels);
  const providers = useModelStore((state) => state.providers);
  const model = useModelStore((state) => state.model);
  const setModel = useModelStore((state) => state.setModel);
  const updateModel = useUpdateConversationModel();
  const modelProvider = providers.find((p) => p.models.some((m) => m.id === model.id));
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const selectedModelData = models.find((m) => m.id === model.id);
  const {
    initialMessage,
    initialModel: contextInitialModel,
    initialBrowse,
    setInitialMessage,
    setInitialModel: setContextInitialModel,
    setInitialBrowse,
  } = useInitialMessage();
  const [browse, setBrowse] = useState(initialBrowse);
  const hasSentInitial = useRef(false);
  const { messages, sendMessage, status, stop } = useChat<CustomUIMessage>({
    transport: new DefaultChatTransport({
      api: "/api/mock",
      prepareSendMessagesRequest({ id, messages, body }) {
        const messagesToSend = body?.temporaryChat ? messages : [messages.at(-1)];
        return { body: { id, messages: messagesToSend, ...body } };
      },
    }),
    id,
    messages: initialMessages,
  });

  const handleStop = () => {
    if (status === "streaming") {
      stop();
    }
  };

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) {
        return;
      }

      sendMessage(
        {
          ...message,
          metadata: {
            content: message.text,
            createdAt: new Date(),
          },
        },
        {
          body: {
            id,
            model: model.id,
            temporaryChat: false,
            browse,
          },
        }
      );
    },
    [id, model.id, browse, sendMessage]
  );

  useEffect(() => {
    const modelToUse = initialModel || contextInitialModel;
    if (modelToUse) {
      setModel(modelToUse);
      setContextInitialModel(null);
    }
  }, [initialModel, contextInitialModel, setModel, setContextInitialModel]);

  useEffect(() => {
    if (
      initialMessage &&
      messages.length === 0 &&
      !hasSentInitial.current &&
      model.id &&
      providers.length > 0
    ) {
      hasSentInitial.current = true;
      handleSubmit({ text: initialMessage, files: [] });
      setInitialMessage(null);
      setInitialBrowse(false);
    }
  }, [
    initialMessage,
    messages.length,
    handleSubmit,
    setInitialMessage,
    setInitialBrowse,
    model.id,
    providers.length,
  ]);

  useEffect(() => {
    const isNew = searchParams.get("new");
    if (isNew && messages.some((msg) => msg.role === "assistant")) {
      router.replace(`/mock/${id}`);
    }
  }, [messages, searchParams, router, id]);

  const streamingMessages = useMemo(() => {
    const persistedIds = new Set(initialMessages.map((m) => m.id));
    return messages.filter((msg) => !persistedIds.has(msg.id));
  }, [messages, initialMessages]);

  const existingMessagesList = useMemo(
    () =>
      initialMessages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          conversationId={id}
          isStreaming={false}
        />
      )),
    [initialMessages, id]
  );

  const streamingMessagesList = useMemo(
    () =>
      streamingMessages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          conversationId={id}
          isStreaming={true}
        />
      )),
    [streamingMessages, id]
  );

  return (
    <div className="flex h-full flex-col gap-4 md:py-4">
      <Conversation>
        <div className="absolute top-0 h-2 w-full bg-linear-to-b from-background to-transparent" />
        <ConversationContent className="p-0">
          <ChatLayoutWrapper className="p-4 md:p-8">
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
          </ChatLayoutWrapper>
        </ConversationContent>
        <ConversationScrollButton />
        <div className="absolute bottom-0 h-2 w-full bg-linear-to-t from-background to-transparent" />
      </Conversation>

      <PromptInputProvider>
        <ChatLayoutWrapper>
          <PromptInput
            globalDrop
            multiple
            onSubmit={handleSubmit}
            accept={model?.extensions?.join(",")}
            className="md:px-4"
          >
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputBody>
              <PromptInputTextarea />
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
    </div>
  );
}
