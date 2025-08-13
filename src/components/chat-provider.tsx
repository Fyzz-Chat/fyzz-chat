"use client";

import { useAddMessage } from "@/lib/queries/conversations";
import { useTRPC } from "@/lib/trpc/client";
import { filterMessagesUpToAnchor, isFileList } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import { useFileStore } from "@/stores/file-store";
import { useModelStore } from "@/stores/model-store";
import type { CustomUIMessage } from "@/types/chat";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport, type UIMessage } from "ai";
import React, { type ReactNode, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

/**
 * This component is a "controller" that bridges the `ai/react` `useChat` hook
 * with our global `useChatStore`. It's the only component that calls `useChat`,
 * isolating its high-frequency re-renders. It then syncs the state to and from
 * the Zustand store, which the rest of the application can subscribe to performantly.
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const queryClient = useQueryClient();
  const addMessage = useAddMessage();
  const trpc = useTRPC();

  // Get state and actions using granular selectors to prevent infinite loops
  const model = useModelStore((state) => state.model);
  const temporaryChat = useModelStore((state) => state.temporaryChat);
  const files = useFileStore((state) => state.files);
  const setFiles = useFileStore((state) => state.setFiles);
  const stableId = useChatStore((state) => state.stableId);
  const browse = useChatStore((state) => state.browse);
  const setStableId = useChatStore((state) => state.setStableId);
  const [input, setInput] = useState("");

  const nextMessageId = useRef<string>(uuidv4());
  const sentRef = useRef(false);

  // Set the initial stableId from URL params or generate a new one
  useEffect(() => {
    if (params.id) {
      setStableId(params.id as string);
    } else {
      setStableId(uuidv4());
    }
  }, [params.id, setStableId]);

  const transport = new DefaultChatTransport({
    api: temporaryChat ? "/api/chat/temp" : "/api/chat",
  });

  // This is the only place `useChat` is called.
  const { messages, status, error, stop, regenerate, setMessages, sendMessage } = useChat(
    {
      transport,
      id: stableId,
      generateId: () => nextMessageId.current,
      onFinish: async ({ message }: { message: UIMessage }) => {
        await addMessage.mutateAsync({
          message: message as UIMessage,
          conversationId: stableId,
        });
        const conversation = queryClient.getQueryData<{
          id: string;
          model: string;
          title: string;
        }>(trpc.conversation.queryKey({ id: stableId }));

        if (conversation?.title === "New Chat") {
          queryClient.invalidateQueries(trpc.infiniteConversations.infiniteQueryFilter());
        }
      },
    }
  );

  // Effect to sync state FROM `useChat` hook TO the Zustand store
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const isStreaming = status === "streaming" && lastMessage?.role === "assistant";

    useChatStore.setState({
      lastMessage: isStreaming ? lastMessage : null,
      status,
      error,
      input,
    });
  }, [messages, status, error, input]);

  // Effect to sync actions FROM `useChat` hook TO the Zustand store
  useEffect(() => {
    // This connects the live functions from the hook to our store's actions
    useChatStore.setState({
      stop,
      regenerate,
      setChatInput: (newInput: string) => {
        nextMessageId.current = uuidv4();
        setInput(newInput);
        return nextMessageId.current;
      },
      emptySubmit: () => {
        sendMessage();
        setFiles(undefined);
      },
      deleteMessagesAfter: (messageId: string, newContent?: string) => {
        setMessages((old: UIMessage[]) =>
          filterMessagesUpToAnchor(old as CustomUIMessage[], messageId, newContent)
        );
      },
    });
  }, [stop, regenerate, setInput, sendMessage, setFiles, setMessages]);

  // Effect to handle automatic submission on input change
  useEffect(() => {
    if (status === "ready" && input && stableId && !sentRef.current) {
      sentRef.current = true;
      sendMessage(
        {
          text: input,
          files,
        },
        {
          body: {
            id: stableId,
            model: model.id,
            temporaryChat,
            browse,
          },
        }
      );
      setFiles(undefined);
      setInput("");
    }

    if (!input) {
      sentRef.current = false;
    }
  }, [
    status,
    input,
    stableId,
    sendMessage,
    files,
    setFiles,
    model,
    browse,
    temporaryChat,
  ]);

  return <>{children}</>;
}
