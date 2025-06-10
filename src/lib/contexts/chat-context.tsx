"use client";

import { useFileStore } from "@/stores/file-store";
import { useModelStore } from "@/stores/model-store";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import type { Message } from "ai";
import { useParams } from "next/navigation";
import React, {
  createContext,
  useContext,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { conversationKeys, useAddMessage } from "../queries/conversations";

type ChatStatus = "submitted" | "streaming" | "ready" | "error";

interface ChatContextType {
  stableId: string;
  setStableId: (stableId: string) => void;
  messages: Message[];
  setChatInput: (input: string) => string;
  status: ChatStatus;
  error?: Error;
  stop: () => void;
  emptySubmit: () => void;
  browse: boolean;
  setBrowse: (browse: boolean) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const [stableId, setStableId] = useState("");
  const queryClient = useQueryClient();
  const addMessage = useAddMessage();
  const { model, temporaryChat } = useModelStore();
  const sentRef = useRef(false);
  const { files, setFiles } = useFileStore();
  const [browse, setBrowse] = useState(false);
  const nextMessageId = useRef<string>(uuidv4());

  useEffect(() => {
    if (params.id) {
      setStableId(params.id as string);
    } else {
      setStableId(uuidv4());
    }
  }, [params.id]);

  const { messages, status, input, setInput, handleSubmit, error, stop } = useChat({
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
  }, [status, input, handleSubmit, stableId]);

  function setChatInput(input: string) {
    nextMessageId.current = uuidv4();
    setInput(input);
    return nextMessageId.current;
  }

  function emptySubmit() {
    handleSubmit(new Event("submit"), {
      allowEmptySubmit: true,
    });
    setFiles(undefined);
  }

  return (
    <ChatContext.Provider
      value={{
        stableId,
        setStableId,
        messages,
        setChatInput,
        status,
        error,
        stop,
        emptySubmit,
        browse,
        setBrowse,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
