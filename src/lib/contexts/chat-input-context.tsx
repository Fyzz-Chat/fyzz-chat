"use client";

import type { ChatStatus } from "ai";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import type { ReasoningEffort } from "@/types/provider";

interface ChatInputHandlers {
  onSubmit: (message: PromptInputMessage) => void;
  onStop?: () => void;
  onModelChange?: (conversationId: string, modelId: string) => void;
}

interface ChatInputContextType {
  handlersRef: React.RefObject<ChatInputHandlers>;
  browseRef: React.RefObject<boolean>;
  reasoningEffortRef: React.RefObject<ReasoningEffort | undefined>;
  setStatus: (status: ChatStatus) => void;
  setAreFilesUploading: (uploading: boolean) => void;
  setHandlers: (handlers: ChatInputHandlers) => void;
}

interface ChatInputStatusContextType {
  status: ChatStatus;
  areFilesUploading: boolean;
}

const ChatInputContext = createContext<ChatInputContextType | undefined>(undefined);
const ChatInputStatusContext = createContext<ChatInputStatusContextType | undefined>(
  undefined
);

export function ChatInputProvider({ children }: Readonly<{ children: ReactNode }>) {
  const handlersRef = useRef<ChatInputHandlers>({
    onSubmit: () => {
      // noop default
    },
  });
  const browseRef = useRef(true);
  const reasoningEffortRef = useRef<ReasoningEffort | undefined>(undefined);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [areFilesUploading, setAreFilesUploading] = useState(false);

  const setHandlers = useCallback((handlers: ChatInputHandlers) => {
    handlersRef.current = handlers;
  }, []);

  const stableValue = useMemo(
    () => ({
      handlersRef,
      browseRef,
      reasoningEffortRef,
      setStatus,
      setAreFilesUploading,
      setHandlers,
    }),
    [setHandlers]
  );

  const statusValue = useMemo(
    () => ({
      status,
      areFilesUploading,
    }),
    [status, areFilesUploading]
  );

  return (
    <ChatInputContext.Provider value={stableValue}>
      <ChatInputStatusContext.Provider value={statusValue}>
        {children}
      </ChatInputStatusContext.Provider>
    </ChatInputContext.Provider>
  );
}

export function useChatInput() {
  const context = useContext(ChatInputContext);
  if (context === undefined) {
    throw new Error("useChatInput must be used within a ChatInputProvider");
  }
  return context;
}

export function useChatInputStatus() {
  const context = useContext(ChatInputStatusContext);
  if (context === undefined) {
    throw new Error("useChatInputStatus must be used within a ChatInputProvider");
  }
  return context;
}
