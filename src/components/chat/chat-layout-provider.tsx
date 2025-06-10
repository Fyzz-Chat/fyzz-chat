import { ChatLayoutContextProvider } from "@/lib/contexts/chat-layout-context";
import type { ChatLayout } from "@/types/chat";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

export async function ChatLayoutProvider({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const chatLayout = cookieStore.get("fyzz-chat-layout");
  const defaultLayout = chatLayout ? (chatLayout.value as ChatLayout) : "wide";

  return (
    <ChatLayoutContextProvider defaultLayout={defaultLayout}>
      {children}
    </ChatLayoutContextProvider>
  );
}
