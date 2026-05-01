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
  onCancelResearch?: () => void;
  onModelChange?: (conversationId: string, modelId: string) => void;
}

interface ChatInputContextType {
  handlersRef: React.RefObject<ChatInputHandlers>;
  browseRef: React.RefObject<boolean>;
  reasoningEffortRef: React.RefObject<ReasoningEffort | undefined>;
  deepResearchRef: React.RefObject<boolean>;
  setStatus: (status: ChatStatus) => void;
  setAreFilesUploading: (uploading: boolean) => void;
  setHandlers: (handlers: ChatInputHandlers) => void;
  setDeepResearch: (value: boolean) => void;
  setHasPendingResearch: (value: boolean) => void;
}

interface ChatInputStatusContextType {
  status: ChatStatus;
  areFilesUploading: boolean;
  deepResearch: boolean;
  hasPendingResearch: boolean;
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
  const deepResearchRef = useRef(false);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [areFilesUploading, setAreFilesUploading] = useState(false);
  const [deepResearch, setDeepResearchState] = useState(false);
  const [hasPendingResearch, setHasPendingResearch] = useState(false);

  const setHandlers = useCallback((handlers: ChatInputHandlers) => {
    handlersRef.current = handlers;
  }, []);

  const setDeepResearch = useCallback((value: boolean) => {
    deepResearchRef.current = value;
    setDeepResearchState(value);
  }, []);

  const stableValue = useMemo(
    () => ({
      handlersRef,
      browseRef,
      reasoningEffortRef,
      deepResearchRef,
      setStatus,
      setAreFilesUploading,
      setHandlers,
      setDeepResearch,
      setHasPendingResearch,
    }),
    [setHandlers, setDeepResearch]
  );

  const statusValue = useMemo(
    () => ({
      status,
      areFilesUploading,
      deepResearch,
      hasPendingResearch,
    }),
    [status, areFilesUploading, deepResearch, hasPendingResearch]
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
