import type { ReactNode } from "react";
import { ChatLayoutProvider } from "@/components/chat/chat-layout-provider";
import ModelStoreInitializer from "@/components/chat/model-store-initializer";
import { EnterHandler, EscapeHandler } from "@/components/key-handler";
import { InitialMessageProvider } from "@/lib/contexts/initial-message-context";
import { caller } from "@/lib/trpc/server";

export default async function Layout({ children }: { children: ReactNode }) {
  const providers = await caller.providers();

  return (
    <InitialMessageProvider>
      <EnterHandler />
      <EscapeHandler />
      <ModelStoreInitializer providers={providers} />
      <ChatLayoutProvider>{children}</ChatLayoutProvider>
    </InitialMessageProvider>
  );
}
