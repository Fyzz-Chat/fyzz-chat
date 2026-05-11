"use client";

import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
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
import { cancelDeepResearch, startDeepResearch } from "@/lib/actions/research";
import { useChatInput } from "@/lib/contexts/chat-input-context";
import { useChatLayout } from "@/lib/contexts/chat-layout-context";
import { useInitialMessage } from "@/lib/contexts/initial-message-context";
import {
  MESSAGES_DEFAULT_LIMIT,
  useAddMessage,
  useConversation,
  useCreateConversationOptimistic,
  useMessages,
  useUpdateConversationModel,
} from "@/lib/queries/conversations";
import { useOptimisticallyTrimMessagesUpToAnchor } from "@/lib/queries/messages";
import { useTRPC } from "@/lib/trpc/client";
import { cn, filterMessagesUpToAnchor, uploadFileParts } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import type { CustomUIMessage } from "@/types/chat";

const MESSAGE_WINDOW_SIZE = MESSAGES_DEFAULT_LIMIT;

export default function ChatMessageList({ id }: Readonly<{ id: string }>) {
  const router = useRouter();
  const { layout } = useChatLayout();
  const providers = useModelStore((state) => state.providers);
  const model = useModelStore((state) => state.model);
  const setModel = useModelStore((state) => state.setModel);
  const updateModel = useUpdateConversationModel();
  const {
    setHandlers,
    setStatus,
    setAreFilesUploading,
    browseRef,
    reasoningEffortRef,
    deepResearchRef,
    setDeepResearch,
    setHasPendingResearch,
  } = useChatInput();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
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
  const conversationTitle = conversationData.data?.title;
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = conversationTitle ? `Fyzz chat - ${conversationTitle}` : "Fyzz chat";
  }, [conversationTitle]);
  const [persistedWindowLimit, setPersistedWindowLimit] = useState(MESSAGE_WINDOW_SIZE);

  const persistedMessagesData = useMessages(id, {
    refetchOnMount: !isNewConversation,
    page: 1,
    limit: persistedWindowLimit,
  });
  const persistedMessages = useMemo(() => {
    const raw = persistedMessagesData.data?.messages || [];
    return [...raw].sort(
      (a, b) =>
        (a.metadata?.sequence ?? Number.POSITIVE_INFINITY) -
        (b.metadata?.sequence ?? Number.POSITIVE_INFINITY)
    );
  }, [persistedMessagesData.data?.messages]);
  const hasMorePersistedMessages = Boolean(persistedMessagesData.data?.hasMore);
  const trimPersistedMessages = useOptimisticallyTrimMessagesUpToAnchor(id);

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

  const { messages, setMessages, sendMessage, status, stop, regenerate, clearError } =
    useChat<CustomUIMessage>({
      transport,
      id,
      generateId: () => nextMessageId.current,
      messages: persistedMessages,
      onFinish: async ({ message }: { message: CustomUIMessage }) => {
        await addMessage.mutateAsync({ message });
      },
      onError: (error) => {
        const fallback = "Something went wrong. Please try again.";
        toast.error(error?.message?.trim() || fallback);
      },
    });

  useEffect(() => {
    if (status === "error") {
      clearError();
    }
  }, [status, clearError]);

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
      setMessagesRef.current(
        filterMessagesUpToAnchor(messagesRef.current, messageId, newContent)
      );

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
    async (message: PromptInputMessage, modelIdOverride?: string) => {
      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) {
        return;
      }

      if (deepResearchRef.current && hasText) {
        setDeepResearch(false);
        const userMessageId = nextMessageId.current;
        const queryText = message.text || "";
        const userMessage: CustomUIMessage = {
          id: userMessageId,
          role: "user",
          parts: [{ type: "text" as const, text: queryText }],
          metadata: { content: queryText, createdAt: new Date() },
        };

        await addMessage.mutateAsync({ message: userMessage });

        try {
          await startDeepResearch({
            conversationId: id,
            query: queryText,
            userMessageId,
          });
          await Promise.all([
            queryClient.invalidateQueries(trpc.messages.queryFilter({ id })),
            queryClient.invalidateQueries(trpc.conversation.queryFilter({ id })),
            queryClient.invalidateQueries(
              trpc.infiniteConversations.infiniteQueryFilter()
            ),
          ]);
        } catch (err) {
          console.error("startDeepResearch failed", err);
          toast.error("Could not start deep research. Please try again.");
          // Server didn't persist anything; refetching restores truth and removes the optimistic user message.
          await queryClient.invalidateQueries(trpc.messages.queryFilter({ id }));
        }

        nextMessageId.current = uuidv4();
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
            model: modelIdOverride ?? model.id,
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
      deepResearchRef,
      setDeepResearch,
      queryClient,
      trpc,
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
      const modelId = contextInitialModel ?? model.id;
      if (initialMessage && messages.length === 0 && !hasSentInitial.current && modelId) {
        hasSentInitial.current = true;
        try {
          await createConversationOptimistic.mutateAsync({
            id,
            title: "New Chat",
            model: modelId,
            lastMessageAt: new Date(),
            branchedFrom: null,
            projectId: initialProjectId ?? null,
          });
          await handleSubmit({ text: initialMessage, files: initialFiles }, modelId);
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
    contextInitialModel,
    model.id,
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
          isStreaming={false}
          onRegenerate={handleRegenerateMessage}
          onEdit={handleEditMessage}
        />
      )),
    [id, persistedMessages, handleRegenerateMessage, handleEditMessage]
  );

  const streamingMessagesList = useMemo(
    () =>
      streamingMessages.map((message) => (
        <MessageItem
          key={message.id}
          conversationId={id}
          message={message}
          isStreaming={message.id === activeStreamingAssistantId}
          onRegenerate={handleRegenerateMessage}
          onEdit={handleEditMessage}
        />
      )),
    [
      id,
      streamingMessages,
      activeStreamingAssistantId,
      handleRegenerateMessage,
      handleEditMessage,
    ]
  );

  useEffect(() => {
    if (
      !initialMessage &&
      !hasSentInitial.current &&
      conversationData.data === null &&
      !conversationData.isFetching
    ) {
      router.replace("/chat");
    }
  }, [initialMessage, conversationData.data, conversationData.isFetching, router]);

  useEffect(() => {
    setStatus(status);
  }, [status, setStatus]);

  const hasPendingResearch = useMemo(
    () =>
      persistedMessages.some(
        (m) => m.role === "assistant" && m.metadata?.status === "pending"
      ),
    [persistedMessages]
  );

  useEffect(() => {
    setHasPendingResearch(hasPendingResearch);
    if (hasPendingResearch) {
      setDeepResearch(false);
    }
    return () => setHasPendingResearch(false);
  }, [hasPendingResearch, setHasPendingResearch, setDeepResearch]);

  const handleCancelResearch = useCallback(async () => {
    const pending = persistedMessagesRef.current.find(
      (m) => m.role === "assistant" && m.metadata?.status === "pending"
    );
    if (!pending) return;
    try {
      await cancelDeepResearch(pending.id);
    } catch (err) {
      console.error("cancelDeepResearch failed", err);
      toast.error("Could not cancel research. Please try again.");
    }
    await queryClient.invalidateQueries(trpc.messages.queryFilter({ id }));
  }, [id, queryClient, trpc]);

  useEffect(() => {
    setHandlers({
      onSubmit: handleSubmit,
      onStop: handleStop,
      onCancelResearch: handleCancelResearch,
      onModelChange: (_, modelId) => {
        const previousModel = model.id;
        updateModel.mutateAsync({ conversationId: id, model: modelId }).catch(() => {
          setModel(previousModel);
        });
      },
    });
  }, [
    handleSubmit,
    handleStop,
    handleCancelResearch,
    updateModel,
    id,
    setHandlers,
    model.id,
    setModel,
  ]);

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
