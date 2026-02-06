"use client";

import "katex/dist/katex.min.css";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import MessageItem from "@/app/mock/[id]/message-item";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { ChatLayoutWrapper } from "@/components/chat/chat-layout-wrapper";
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
import { uploadFileParts } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import type { CustomUIMessage } from "@/types/chat";

export default function MockMessageList({ id }: { id: string }) {
  const router = useRouter();
  const providers = useModelStore((state) => state.providers);
  const model = useModelStore((state) => state.model);
  const setModel = useModelStore((state) => state.setModel);
  const updateModel = useUpdateConversationModel();
  const { setHandlers, setStatus, setAreFilesUploading } = useMockInput();
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
  const nextMessageId = useRef<string>(crypto.randomUUID());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const { messages, sendMessage, status, stop, regenerate } = useChat<CustomUIMessage>({
    transport: new DefaultChatTransport({
      api: "/api/mock",
      prepareSendMessagesRequest({ id, messages, body }) {
        const messagesToSend = body?.temporaryChat ? messages : [messages.at(-1)];
        return { body: { id, messages: messagesToSend, ...body } };
      },
    }),
    id,
    generateId: () => nextMessageId.current,
    messages: persistedMessages,
    onFinish: async ({ message }: { message: CustomUIMessage }) => {
      await addMessage.mutateAsync({
        message,
      });
    },
  });

  const handleStop = useCallback(() => {
    if (status === "streaming") {
      stop();
    }
  }, [status, stop]);

  const handleRegenerateMessage = useCallback(
    async (messageId: string) => {
      await regenerateMessage.mutateAsync({
        messageId,
        conversationId: id,
      });
      await regenerate({
        messageId,
        body: {
          id,
          model: model.id,
          temporaryChat: false,
        },
      });
    },
    [regenerateMessage, regenerate, id, model.id]
  );

  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      await regenerateMessage.mutateAsync({
        messageId,
        conversationId: id,
        newContent,
      });
      await regenerate({
        messageId,
        body: {
          id,
          model: model.id,
          temporaryChat: false,
        },
      });
    },
    [regenerateMessage, regenerate, id, model.id]
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
          },
        }
      );

      nextMessageId.current = crypto.randomUUID();
    },
    [id, model.id, sendMessage, addMessage, setAreFilesUploading]
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
    if (
      initialMessage &&
      messages.length === 0 &&
      !hasSentInitial.current &&
      model.id &&
      providers.length > 0
    ) {
      hasSentInitial.current = true;
      createConversationOptimistic.mutateAsync({
        id,
        title: "New Chat",
        model: model.id,
        messages: [],
        lastMessageAt: new Date(),
      });
      handleSubmit({ text: initialMessage, files: initialFiles });
      setInitialMessage(null);
      setInitialFiles([]);
      setAreFilesUploading(false);
    }
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
      !hasSentInitial.current &&
      !persistedMessagesData.isPending &&
      !conversationData.isPending &&
      streamingMessages.length === 0 &&
      persistedMessages.length === 0
    ) {
      router.push("/mock");
    }
  }, [
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
    <div className="flex h-[calc(100svh-116px)] flex-col overflow-auto md:h-[calc(100svh-148px)]">
      <Conversation>
        <div className="absolute top-0 h-2 w-full bg-linear-to-b from-background to-transparent" />
        <ConversationContent className="p-0">
          <ChatLayoutWrapper className="p-4 md:p-8">
            {!mounted ||
            (persistedMessages.length === 0 && streamingMessages.length === 0) ? null : (
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
    </div>
  );
}
