"use client";

import { filterMessagesUpToAnchor } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import { useFileStore } from "@/stores/file-store";
import { useModelStore } from "@/stores/model-store";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import type { Message } from "ai";
import { useParams } from "next/navigation";
import React, { type ReactNode, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { conversationKeys, useAddMessage } from "../lib/queries/conversations";

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

  // Get state and actions using granular selectors to prevent infinite loops
  const model = useModelStore((state) => state.model);
  const temporaryChat = useModelStore((state) => state.temporaryChat);
  const files = useFileStore((state) => state.files);
  const setFiles = useFileStore((state) => state.setFiles);
  const stableId = useChatStore((state) => state.stableId);
  const browse = useChatStore((state) => state.browse);
  const setStableId = useChatStore((state) => state.setStableId);

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

  // This is the only place `useChat` is called.
  const {
    messages,
    status,
    input,
    setInput,
    handleSubmit,
    error,
    stop,
    reload,
    setMessages,
  } = useChat({
    api: temporaryChat ? "/api/chat/temp" : "/api/chat",
    id: stableId,
    experimental_prepareRequestBody: ({ messages, id }) => {
      return {
        message: messages[messages.length - 1],
        messages: temporaryChat ? messages : null,
        id,
        model: model.id,
        temporaryChat,
        browse,
      };
    },
    sendExtraMessageFields: true,
    generateId: () => nextMessageId.current,
    onFinish: async (message: Message) => {
      await addMessage.mutateAsync({
        message,
        conversationId: stableId,
      });
      const conversation = queryClient.getQueryData<{
        id: string;
        model: string;
        title: string;
      }>(conversationKeys.details(stableId));

      if (conversation?.title === "New Chat") {
        queryClient.invalidateQueries({
          queryKey: conversationKeys.list(),
        });
      }
    },
  });

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
      reload,
      setChatInput: (newInput: string) => {
        nextMessageId.current = uuidv4();
        setInput(newInput);
        return nextMessageId.current;
      },
      emptySubmit: () => {
        handleSubmit(new Event("submit"), {
          allowEmptySubmit: true,
        });
        setFiles(undefined);
      },
      deleteMessagesAfter: (messageId: string, newContent?: string) => {
        setMessages((old: Message[]) =>
          filterMessagesUpToAnchor(old, messageId, newContent)
        );
      },
    });
  }, [stop, reload, setInput, handleSubmit, setFiles, setMessages]);

  // Effect to handle automatic submission on input change
  useEffect(() => {
    if (status === "ready" && input && stableId && !sentRef.current) {
      sentRef.current = true;
      handleSubmit(new Event("submit"), {
        experimental_attachments: files,
      });
      setFiles(undefined);
    }

    if (!input) {
      sentRef.current = false;
    }
  }, [status, input, stableId, handleSubmit, files, setFiles]);

  return <>{children}</>;
}
