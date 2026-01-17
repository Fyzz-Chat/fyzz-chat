"use client";

import { type UseChatHelpers, useChat } from "@ai-sdk/react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useStableId } from "@/hooks/use-stable-id";
import { useBrowseContext } from "@/lib/contexts/browse-context";
import { useAddMessage } from "@/lib/queries/conversations";
import { useChatStore } from "@/stores/chat-store";
import { useFileStore } from "@/stores/file-store";
import { useModelStore } from "@/stores/model-store";
import type { CustomUIMessage } from "@/types/chat";

type ChatContextType = UseChatHelpers<CustomUIMessage> | null;

const ChatContext = createContext<ChatContextType>(null);

/**
 * This component is a "controller" that bridges the `ai/react` `useChat` hook
 * with our global `useChatStore`. It's the only component that calls `useChat`,
 * isolating its high-frequency re-renders. It then syncs the state to and from
 * the Zustand store, which the rest of the application can subscribe to performantly.
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const addMessage = useAddMessage();

  // Get state and actions using granular selectors to prevent infinite loops
  const model = useModelStore((state) => state.model);
  const temporaryChat = useModelStore((state) => state.temporaryChat);
  const files = useFileStore((state) => state.files);
  const setFiles = useFileStore((state) => state.setFiles);
  const stableId = useStableId();
  const { browse } = useBrowseContext();
  const setStableId = useChatStore((state) => state.setStableId);
  const [input, setInput] = useState("");

  const nextMessageId = useRef<string>(uuidv4());
  const sentRef = useRef(false);

  // Set the initial stableId from URL params or generate a new one
  useEffect(() => {
    setStableId(params.id || uuidv4());
  }, [params.id, setStableId]);

  // This is the only place `useChat` is called.
  const chatApi = useChat({
    id: stableId,
    generateId: () => nextMessageId.current,
    experimental_throttle: 30, // Throttle UI updates to every 30ms during streaming
    onFinish: async ({ message }: { message: CustomUIMessage }) => {
      await addMessage.mutateAsync({
        message,
      });
    },
  });

  const { messages, status, error, stop, regenerate, setMessages, sendMessage } = chatApi;

  // Effect to sync state FROM `useChat` hook TO the Zustand store
  useEffect(() => {
    const lastMessage = messages.at(-1);

    useChatStore.setState({
      lastMessage,
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
      regenerate: (messageId: string) => {
        const { model, temporaryChat } = useModelStore.getState();
        const { stableId } = useChatStore.getState();
        regenerate({
          messageId,
          body: {
            id: stableId,
            model: model.id,
            temporaryChat,
            browse,
          },
        });
      },
      setChatInput: (newInput: string) => {
        nextMessageId.current = uuidv4();
        setInput(newInput);
        return nextMessageId.current;
      },
      emptySubmit: () => {
        const { model, temporaryChat } = useModelStore.getState();
        const { stableId } = useChatStore.getState();
        const { setFiles } = useFileStore.getState();
        setMessages([]);
        sendMessage(undefined, {
          body: {
            id: stableId,
            model: model.id,
            temporaryChat,
            browse,
          },
        });
        setFiles(undefined);
      },
      editMessage: (messageId: string, content: string) => {
        setMessages((old: CustomUIMessage[]) =>
          old.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  parts: message.parts.map((part) =>
                    part.type === "text" ? { ...part, text: content } : part
                  ),
                }
              : message
          )
        );
      },
    });
  }, [stop, regenerate, sendMessage, setMessages, browse]);

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

      if (!temporaryChat) {
        setMessages((_old) => []);
      }
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
    setMessages,
  ]);

  return <ChatContext.Provider value={chatApi}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
}
