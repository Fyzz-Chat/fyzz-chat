import type { ReactNode } from "react";
import { ChatLayoutProvider } from "@/components/chat/chat-layout-provider";

export default function Layout({ children }: { children: ReactNode }) {
  return <ChatLayoutProvider>{children}</ChatLayoutProvider>;
}
