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

interface MockInputHandlers {
  onSubmit: (message: PromptInputMessage) => void;
  onStop?: () => void;
  onModelChange?: (conversationId: string, modelId: string) => void;
}

interface MockInputContextType {
  handlersRef: React.RefObject<MockInputHandlers>;
  browseRef: React.RefObject<boolean>;
  status: ChatStatus;
  setStatus: (status: ChatStatus) => void;
  areFilesUploading: boolean;
  setAreFilesUploading: (uploading: boolean) => void;
  setHandlers: (handlers: MockInputHandlers) => void;
}

const MockInputContext = createContext<MockInputContextType | undefined>(undefined);

export function MockInputProvider({ children }: { children: ReactNode }) {
  const handlersRef = useRef<MockInputHandlers>({
    onSubmit: () => {
      // noop default
    },
  });
  const browseRef = useRef(false);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [areFilesUploading, setAreFilesUploading] = useState(false);

  const setHandlers = useCallback((handlers: MockInputHandlers) => {
    handlersRef.current = handlers;
  }, []);

  const value = useMemo(
    () => ({
      handlersRef,
      browseRef,
      status,
      setStatus,
      areFilesUploading,
      setAreFilesUploading,
      setHandlers,
    }),
    [status, areFilesUploading, setHandlers]
  );

  return <MockInputContext.Provider value={value}>{children}</MockInputContext.Provider>;
}

export function useMockInput() {
  const context = useContext(MockInputContext);
  if (context === undefined) {
    throw new Error("useMockInput must be used within a MockInputProvider");
  }
  return context;
}
