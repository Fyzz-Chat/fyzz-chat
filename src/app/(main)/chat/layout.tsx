import type { ReactNode } from "react";
import ChatInput from "@/components/chat/chat-input";
import Pad from "@/components/chat/pad";

export default function ChatLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <div className="flex-1">{children}</div>
      <Pad>
        <ChatInput />
      </Pad>
    </>
  );
}
