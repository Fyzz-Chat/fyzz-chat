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
  setStatus: (status: ChatStatus) => void;
  setAreFilesUploading: (uploading: boolean) => void;
  setHandlers: (handlers: MockInputHandlers) => void;
}

interface MockInputStatusContextType {
  status: ChatStatus;
  areFilesUploading: boolean;
}

const MockInputContext = createContext<MockInputContextType | undefined>(undefined);
const MockInputStatusContext = createContext<MockInputStatusContextType | undefined>(
  undefined
);

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

  const stableValue = useMemo(
    () => ({
      handlersRef,
      browseRef,
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
    <MockInputContext.Provider value={stableValue}>
      <MockInputStatusContext.Provider value={statusValue}>
        {children}
      </MockInputStatusContext.Provider>
    </MockInputContext.Provider>
  );
}

export function useMockInput() {
  const context = useContext(MockInputContext);
  if (context === undefined) {
    throw new Error("useMockInput must be used within a MockInputProvider");
  }
  return context;
}

export function useMockInputStatus() {
  const context = useContext(MockInputStatusContext);
  if (context === undefined) {
    throw new Error("useMockInputStatus must be used within a MockInputProvider");
  }
  return context;
}
