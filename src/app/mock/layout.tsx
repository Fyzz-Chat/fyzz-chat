import type { ReactNode } from "react";
import { ChatLayoutProvider } from "@/components/chat/chat-layout-provider";
import { InitialMessageProvider } from "@/lib/contexts/initial-message-context";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <InitialMessageProvider>
      <ChatLayoutProvider>{children}</ChatLayoutProvider>
    </InitialMessageProvider>
  );
}
