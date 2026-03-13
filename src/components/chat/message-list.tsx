"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { ChatLayoutWrapper } from "@/components/chat/chat-layout-wrapper";
import MessageItem from "@/components/chat/message-item";
import { Button } from "@/components/ui/button";
import { useChatInput } from "@/lib/contexts/chat-input-context";
import { useChatLayout } from "@/lib/contexts/chat-layout-context";
import { useInitialMessage } from "@/lib/contexts/initial-message-context";
import {
  useAddMessage,
  useConversation,
  useCreateConversationOptimistic,
  useMessages,
  useUpdateConversationModel,
} from "@/lib/queries/conversations";
import { useOptimisticallyTrimMessagesUpToAnchor } from "@/lib/queries/messages";
import { useShares } from "@/lib/queries/shares";
import { cn, uploadFileParts } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import type { CustomUIMessage, ShareInfo } from "@/types/chat";

const MESSAGE_WINDOW_SIZE = 16;

export default function ChatMessageList({ id }: Readonly<{ id: string }>) {
  const router = useRouter();
  const { layout } = useChatLayout();
  const providers = useModelStore((state) => state.providers);
  const model = useModelStore((state) => state.model);
  const setModel = useModelStore((state) => state.setModel);
  const updateModel = useUpdateConversationModel();
  const { setHandlers, setStatus, setAreFilesUploading, browseRef, reasoningEffortRef } =
    useChatInput();
  const addMessage = useAddMessage(id);
  const createConversationOptimistic = useCreateConversationOptimistic();
  const {
    initialMessage,
    initialModel: contextInitialModel,
    initialFiles,
    initialProjectId,
    setInitialMessage,
    setInitialModel: setContextInitialModel,
    setInitialFiles,
    setInitialProjectId,
  } = useInitialMessage();
  const isNewConversation = Boolean(initialMessage);
  const conversationData = useConversation(id);
  const [persistedWindowLimit, setPersistedWindowLimit] = useState(MESSAGE_WINDOW_SIZE);

  const persistedMessagesData = useMessages(id, {
    refetchOnMount: !isNewConversation,
    page: 1,
    limit: persistedWindowLimit,
  });
  const persistedMessages = persistedMessagesData.data?.messages || [];
  const hasMorePersistedMessages = Boolean(persistedMessagesData.data?.hasMore);
  const trimPersistedMessages = useOptimisticallyTrimMessagesUpToAnchor(id);

  const { data: sharesData } = useShares(id);
  const sharesByMessageId = useMemo(() => {
    const map = new Map<string, ShareInfo>();
    sharesData?.shares.forEach((share) => {
      map.set(share.messageId, share);
    });
    return map;
  }, [sharesData]);
  const isLoadingOlderMessages =
    persistedMessagesData.isFetching && !persistedMessagesData.isPending;
  const hasSentInitial = useRef(false);
  const nextMessageId = useRef<string>(uuidv4());

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest({ id, messages, body, trigger, messageId }) {
          const messagesToSend = body?.temporaryChat ? messages : [messages.at(-1)];
          return { body: { id, messages: messagesToSend, trigger, messageId, ...body } };
        },
      }),
    []
  );

  const { messages, setMessages, sendMessage, status, stop, regenerate } =
    useChat<CustomUIMessage>({
      transport,
      id,
      generateId: () => nextMessageId.current,
      messages: persistedMessages,
      onFinish: async ({ message }: { message: CustomUIMessage }) => {
        await addMessage.mutateAsync({ message });
      },
    });

  const stopRef = useRef(stop);
  stopRef.current = stop;
  const regenerateRef = useRef(regenerate);
  regenerateRef.current = regenerate;
  const sendMessageRef = useRef(sendMessage);
  sendMessageRef.current = sendMessage;
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const persistedMessagesRef = useRef(persistedMessages);
  persistedMessagesRef.current = persistedMessages;
  const setMessagesRef = useRef(setMessages);
  setMessagesRef.current = setMessages;

  const ensureChatHasMessageId = useCallback((messageId: string) => {
    const chatMessages = messagesRef.current;
    if (chatMessages.some((m) => m.id === messageId)) {
      return true;
    }

    const persisted = persistedMessagesRef.current;
    if (persisted.some((m) => m.id === messageId)) {
      setMessagesRef.current(persisted);
      return true;
    }

    return false;
  }, []);

  // `useChat` does not re-seed its internal message state when `persistedMessages` arrive
  // asynchronously (e.g. from IndexedDB). This can cause regenerate/edit to target a message
  // that exists in the UI (persisted list) but not in the chat state.
  useEffect(() => {
    if (status !== "ready") return;
    if (persistedMessages.length === 0) return;

    const chatIds = new Set(messages.map((m) => m.id));
    const missingPersisted = persistedMessages.some((m) => !chatIds.has(m.id));
    if (!missingPersisted) return;

    setMessages(persistedMessages);
  }, [messages, persistedMessages, setMessages, status]);

  const handleStop = useCallback(() => {
    stopRef.current();
  }, []);

  const handleRegenerateMessage = useCallback(
    async (messageId: string) => {
      if (!ensureChatHasMessageId(messageId)) {
        return;
      }

      const rollback = trimPersistedMessages(messageId);

      try {
        await regenerateRef.current({
          messageId,
          body: {
            id,
            model: model.id,
            temporaryChat: false,
            browse: browseRef.current,
            reasoningEffort: reasoningEffortRef.current,
          },
        });
      } catch {
        rollback();
        // Regeneration failed - user can retry
      }
    },
    [
      ensureChatHasMessageId,
      id,
      model.id,
      browseRef,
      reasoningEffortRef,
      trimPersistedMessages,
    ]
  );

  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!ensureChatHasMessageId(messageId)) {
        return;
      }

      const rollback = trimPersistedMessages(messageId, newContent);

      try {
        await regenerateRef.current({
          messageId,
          body: {
            id,
            model: model.id,
            temporaryChat: false,
            browse: browseRef.current,
            reasoningEffort: reasoningEffortRef.current,
            newContent,
          },
        });
      } catch {
        rollback();
        // Editing failed - user can retry
      }
    },
    [
      ensureChatHasMessageId,
      id,
      model.id,
      browseRef,
      reasoningEffortRef,
      trimPersistedMessages,
    ]
  );

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) {
        return;
      }

      const newMessage: CustomUIMessage = {
        id: nextMessageId.current,
        role: "user",
        parts: [
          ...(hasText
            ? [
                {
                  type: "text" as const,
                  text: message.text || "",
                },
              ]
            : []),
          ...(hasAttachments ? message.files : []),
        ],
        metadata: {
          content: message.text,
          createdAt: new Date(),
        },
      };

      if (hasAttachments) {
        setAreFilesUploading(true);
        message.files = await uploadFileParts(id, message.files);
      }

      await addMessage.mutateAsync({
        message: newMessage,
      });

      sendMessageRef.current(
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
            browse: browseRef.current,
            reasoningEffort: reasoningEffortRef.current,
            ...(initialProjectId && { projectId: initialProjectId }),
          },
        }
      );

      nextMessageId.current = uuidv4();
    },
    [
      id,
      model.id,
      addMessage,
      setAreFilesUploading,
      browseRef,
      reasoningEffortRef,
      initialProjectId,
    ]
  );

  useEffect(() => {
    const modelToUse = conversationData.data?.model || contextInitialModel;
    const canResolveModel = providers.length > 0;
    if (modelToUse && canResolveModel) {
      setModel(modelToUse);
      setContextInitialModel(null);
    }
  }, [
    conversationData.data?.model,
    contextInitialModel,
    providers.length,
    setModel,
    setContextInitialModel,
  ]);

  useEffect(() => {
    const sendInitial = async () => {
      if (
        initialMessage &&
        messages.length === 0 &&
        !hasSentInitial.current &&
        model.id &&
        providers.length > 0
      ) {
        hasSentInitial.current = true;
        try {
          await createConversationOptimistic.mutateAsync({
            id,
            title: "New Chat",
            model: model.id,
            messages: [],
            lastMessageAt: new Date(),
            branchedFrom: null,
            projectId: initialProjectId ?? null,
          });
          await handleSubmit({ text: initialMessage, files: initialFiles });
          setInitialMessage(null);
          setInitialFiles([]);
          setInitialProjectId(null);
          setAreFilesUploading(false);
        } catch {
          hasSentInitial.current = false;
        }
      }
    };
    sendInitial();
  }, [
    initialMessage,
    messages.length,
    handleSubmit,
    createConversationOptimistic,
    setInitialMessage,
    setInitialFiles,
    setInitialProjectId,
    setAreFilesUploading,
    initialFiles,
    initialProjectId,
    model.id,
    providers.length,
    id,
  ]);

  const persistedMessageIds = useMemo(
    () => new Set(persistedMessages.map((m) => m.id)),
    [persistedMessages]
  );

  const streamingMessages = useMemo(() => {
    return messages.filter((msg) => !persistedMessageIds.has(msg.id));
  }, [messages, persistedMessageIds]);

  const activeStreamingAssistantId = useMemo(() => {
    if (status !== "streaming" && status !== "submitted") {
      return null;
    }

    return messages.findLast((message) => message.role === "assistant")?.id ?? null;
  }, [messages, status]);

  const loadOlderMessages = useCallback(() => {
    if (!hasMorePersistedMessages || isLoadingOlderMessages) {
      return;
    }

    setPersistedWindowLimit((currentLimit) => currentLimit + MESSAGE_WINDOW_SIZE);
  }, [hasMorePersistedMessages, isLoadingOlderMessages]);

  const existingMessagesList = useMemo(
    () =>
      persistedMessages.map((message) => (
        <MessageItem
          key={message.id}
          conversationId={id}
          message={message}
          share={sharesByMessageId.get(message.id)}
          isStreaming={false}
          onRegenerate={handleRegenerateMessage}
          onEdit={handleEditMessage}
        />
      )),
    [id, persistedMessages, sharesByMessageId, handleRegenerateMessage, handleEditMessage]
  );

  const streamingMessagesList = useMemo(
    () =>
      streamingMessages.map((message) => (
        <MessageItem
          key={message.id}
          conversationId={id}
          message={message}
          share={sharesByMessageId.get(message.id)}
          isStreaming={message.id === activeStreamingAssistantId}
          onRegenerate={handleRegenerateMessage}
          onEdit={handleEditMessage}
        />
      )),
    [
      id,
      streamingMessages,
      sharesByMessageId,
      activeStreamingAssistantId,
      handleRegenerateMessage,
      handleEditMessage,
    ]
  );

  useEffect(() => {
    if (
      !initialMessage &&
      !hasSentInitial.current &&
      !persistedMessagesData.isPending &&
      !conversationData.isPending &&
      streamingMessages.length === 0 &&
      persistedMessages.length === 0
    ) {
      router.push("/chat");
    }
  }, [
    initialMessage,
    persistedMessagesData.isPending,
    conversationData.isPending,
    streamingMessages.length,
    persistedMessages.length,
    router,
  ]);

  useEffect(() => {
    setStatus(status);
  }, [status, setStatus]);

  useEffect(() => {
    setHandlers({
      onSubmit: handleSubmit,
      onStop: handleStop,
      onModelChange: (_, modelId) => {
        const previousModel = model.id;
        updateModel.mutateAsync({ conversationId: id, model: modelId }).catch(() => {
          setModel(previousModel);
        });
      },
    });
  }, [handleSubmit, handleStop, updateModel, id, setHandlers, model.id, setModel]);

  return (
    <div className="flex h-[calc(100svh-132px)] flex-col overflow-auto md:h-[calc(100svh-164px)]">
      <Conversation>
        <div
          className={cn(
            "absolute top-0 left-1/2 h-2 w-full -translate-x-1/2 bg-linear-to-b from-background to-transparent",
            layout === "compact" ? "max-w-2xl" : "max-w-5xl"
          )}
        />
        <ConversationContent className="p-0">
          <ChatLayoutWrapper className="p-4 md:p-8">
            {persistedMessages.length > 0 && hasMorePersistedMessages ? (
              <div className="mb-4 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadOlderMessages}
                  disabled={isLoadingOlderMessages}
                >
                  {isLoadingOlderMessages
                    ? "Loading older messages..."
                    : "Load older messages"}
                </Button>
              </div>
            ) : null}
            {persistedMessages.length === 0 && streamingMessages.length === 0 ? null : (
              <Fragment>
                {existingMessagesList}
                {streamingMessagesList}
              </Fragment>
            )}
          </ChatLayoutWrapper>
        </ConversationContent>
        <ConversationScrollButton />
        <div
          className={cn(
            "absolute bottom-0 left-1/2 h-2 w-full -translate-x-1/2 bg-linear-to-t from-background to-transparent",
            layout === "compact" ? "max-w-164 md:max-w-160" : "max-w-244 md:max-w-240"
          )}
        />
      </Conversation>
    </div>
  );
}
