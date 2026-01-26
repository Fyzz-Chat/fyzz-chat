"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

interface InitialMessageContextType {
  initialMessage: string | null;
  initialModel: string | null;
  initialBrowse: boolean;
  setInitialMessage: (message: string | null) => void;
  setInitialModel: (model: string | null) => void;
  setInitialBrowse: (browse: boolean) => void;
}

const InitialMessageContext = createContext<InitialMessageContextType | undefined>(
  undefined
);

export function InitialMessageProvider({ children }: { children: ReactNode }) {
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const [initialModel, setInitialModel] = useState<string | null>(null);
  const [initialBrowse, setInitialBrowse] = useState(false);

  return (
    <InitialMessageContext.Provider
      value={{
        initialMessage,
        initialModel,
        initialBrowse,
        setInitialMessage,
        setInitialModel,
        setInitialBrowse,
      }}
    >
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
