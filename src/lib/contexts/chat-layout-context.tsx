"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ChatLayout } from "@/types/chat";

const CHAT_LAYOUT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

interface ChatLayoutContextType {
  layout: ChatLayout;
  setLayout: (layout: ChatLayout) => void;
}

const ChatLayoutContext = createContext<ChatLayoutContextType | null>(null);

export function useChatLayout() {
  const context = useContext(ChatLayoutContext);
  if (!context) {
    throw new Error("useChatLayout must be used within a ChatLayoutProvider");
  }
  return context;
}

export function ChatLayoutContextProvider({
  children,
  defaultLayout = "wide",
}: Readonly<{
  children: ReactNode;
  defaultLayout?: ChatLayout;
}>) {
  const [layout, setLayout] = useState<ChatLayout>(defaultLayout);

  const _setLayout = useCallback((layout: ChatLayout) => {
    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not supported in all browsers
    document.cookie = `fyzz-chat-layout=${layout}; path=/; max-age=${CHAT_LAYOUT_COOKIE_MAX_AGE}`;
    setLayout(layout);
  }, []);

  const value = useMemo(() => ({ layout, setLayout: _setLayout }), [layout, _setLayout]);

  return (
    <ChatLayoutContext.Provider value={value}>{children}</ChatLayoutContext.Provider>
  );
}
