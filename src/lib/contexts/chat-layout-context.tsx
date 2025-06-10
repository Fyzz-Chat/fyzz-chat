"use client";

import type { ChatLayout } from "@/types/chat";
import { type ReactNode, createContext, useCallback, useContext, useState } from "react";

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
}: {
  children: ReactNode;
  defaultLayout?: ChatLayout;
}) {
  const [layout, _setLayout] = useState<ChatLayout>(defaultLayout);

  const setLayout = useCallback(
    (layout: ChatLayout) => {
      document.cookie = `fyzz-chat-layout=${layout}; path=/; max-age=${CHAT_LAYOUT_COOKIE_MAX_AGE}`;
      _setLayout(layout);
    },
    [layout, _setLayout]
  );

  return (
    <ChatLayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </ChatLayoutContext.Provider>
  );
}
