"use client";

import type { FileUIPart } from "ai";
import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

interface InitialMessageContextType {
  initialMessage: string | null;
  initialModel: string | null;
  initialBrowse: boolean;
  initialFiles: FileUIPart[];
  initialProjectId: string | null;
  setInitialMessage: (message: string | null) => void;
  setInitialModel: (model: string | null) => void;
  setInitialBrowse: (browse: boolean) => void;
  setInitialFiles: (files: FileUIPart[]) => void;
  setInitialProjectId: (projectId: string | null) => void;
}

const InitialMessageContext = createContext<InitialMessageContextType | undefined>(
  undefined
);

export function InitialMessageProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const [initialModel, setInitialModel] = useState<string | null>(null);
  const [initialBrowse, setInitialBrowse] = useState(false);
  const [initialFiles, setInitialFiles] = useState<FileUIPart[]>([]);
  const [initialProjectId, setInitialProjectId] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      initialMessage,
      initialModel,
      initialBrowse,
      initialFiles,
      initialProjectId,
      setInitialMessage,
      setInitialModel,
      setInitialBrowse,
      setInitialFiles,
      setInitialProjectId,
    }),
    [initialMessage, initialModel, initialBrowse, initialFiles, initialProjectId]
  );

  return (
    <InitialMessageContext.Provider value={value}>
      {children}
    </InitialMessageContext.Provider>
  );
}

export function useInitialMessage() {
  const context = useContext(InitialMessageContext);
  if (context === undefined) {
    throw new Error("useInitialMessage must be used within an InitialMessageProvider");
  }
  return context;
}
