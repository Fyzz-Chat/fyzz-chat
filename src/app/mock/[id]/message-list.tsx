"use client";

import "katex/dist/katex.min.css";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import MessageItem from "@/app/mock/[id]/message-item";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { ChatLayoutWrapper } from "@/components/chat/chat-layout-wrapper";
import { useChatLayout } from "@/lib/contexts/chat-layout-context";
import { useInitialMessage } from "@/lib/contexts/initial-message-context";
import { useMockInput } from "@/lib/contexts/mock-input-context";
import {
  useAddMessage,
  useConversation,
  useCreateConversationOptimistic,
  useMessages,
  useRegenerateMessage,
  useUpdateConversationModel,
} from "@/lib/queries/conversations";
import { cn, uploadFileParts } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import type { CustomUIMessage } from "@/types/chat";

export default function MockMessageList({ id }: { id: string }) {
  const router = useRouter();
  const { layout } = useChatLayout();
  const providers = useModelStore((state) => state.providers);
  const model = useModelStore((state) => state.model);
  const setModel = useModelStore((state) => state.setModel);
  const updateModel = useUpdateConversationModel();
  const { setHandlers, setStatus, setAreFilesUploading, browseRef } = useMockInput();
  const addMessage = useAddMessage(id);
  const createConversationOptimistic = useCreateConversationOptimistic();
  const regenerateMessage = useRegenerateMessage();
  const {
    initialMessage,
    initialModel: contextInitialModel,
    initialFiles,
    setInitialMessage,
    setInitialModel: setContextInitialModel,
    setInitialFiles,
  } = useInitialMessage();
  const isNewConversation = Boolean(initialMessage);
  const conversationData = useConversation(id);
  const persistedMessagesData = useMessages(id, isNewConversation ? [] : undefined, {
    refetchOnMount: !isNewConversation,
  });
  const persistedMessages = persistedMessagesData.data?.messages || [];
  const hasSentInitial = useRef(false);
  const nextMessageId = useRef<string>(uuidv4());

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/mock",
        prepareSendMessagesRequest({ id, messages, body }) {
          const messagesToSend = body?.temporaryChat ? messages : [messages.at(-1)];
          return { body: { id, messages: messagesToSend, ...body } };
        },
      }),
    []
  );

  const { messages, sendMessage, status, stop, regenerate } = useChat<CustomUIMessage>({
    transport,
    id,
    generateId: () => nextMessageId.current,
    messages: persistedMessages,
    onFinish: async ({ message }: { message: CustomUIMessage }) => {
      await addMessage.mutateAsync({
        message,
      });
    },
  });

  const stopRef = useRef(stop);
  stopRef.current = stop;
  const regenerateRef = useRef(regenerate);
  regenerateRef.current = regenerate;
  const sendMessageRef = useRef(sendMessage);
  sendMessageRef.current = sendMessage;

  const handleStop = useCallback(() => {
    stopRef.current();
  }, []);

  const handleRegenerateMessage = useCallback(
    async (messageId: string) => {
      try {
        await regenerateMessage.mutateAsync({
          messageId,
          conversationId: id,
        });
        await regenerateRef.current({
          messageId,
          body: {
            id,
            model: model.id,
            temporaryChat: false,
            browse: browseRef.current,
          },
        });
      } catch {
        // Regeneration failed - user can retry
      }
    },
    [regenerateMessage, id, model.id, browseRef]
  );

  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      try {
        await regenerateMessage.mutateAsync({
          messageId,
          conversationId: id,
          newContent,
        });
        await regenerateRef.current({
          messageId,
          body: {
            id,
            model: model.id,
            temporaryChat: false,
            browse: browseRef.current,
          },
        });
      } catch {
        // Editing failed - user can retry
      }
    },
    [regenerateMessage, id, model.id, browseRef]
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
          },
        }
      );

      nextMessageId.current = uuidv4();
    },
    [id, model.id, addMessage, setAreFilesUploading, browseRef]
  );

  useEffect(() => {
    const modelToUse = conversationData.data?.model || contextInitialModel;
    if (modelToUse) {
      setModel(modelToUse);
      setContextInitialModel(null);
    }
  }, [
    conversationData.data?.model,
    contextInitialModel,
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
          });
          await handleSubmit({ text: initialMessage, files: initialFiles });
          setInitialMessage(null);
          setInitialFiles([]);
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
    setAreFilesUploading,
    initialFiles,
    model.id,
    providers.length,
    id,
  ]);

  const streamingMessages = useMemo(() => {
    const persistedIds = new Set(persistedMessages.map((m) => m.id));
    return messages.filter((msg) => !persistedIds.has(msg.id));
  }, [messages, persistedMessages]);

  const existingMessagesList = useMemo(
    () =>
      persistedMessages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isStreaming={false}
          onRegenerate={handleRegenerateMessage}
          onEdit={handleEditMessage}
        />
      )),
    [persistedMessages, handleRegenerateMessage, handleEditMessage]
  );

  const streamingMessagesList = useMemo(
    () =>
      streamingMessages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isStreaming={true}
          onRegenerate={handleRegenerateMessage}
          onEdit={handleEditMessage}
        />
      )),
    [streamingMessages, handleRegenerateMessage, handleEditMessage]
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
      router.push("/mock");
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
        updateModel.mutateAsync({ conversationId: id, model: modelId });
      },
    });
  }, [handleSubmit, handleStop, updateModel, id, setHandlers]);

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
