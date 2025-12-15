import type React from "react";
import { ChatLayoutProvider } from "@/components/chat/chat-layout-provider";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ChatLayoutProvider>
      <SidebarProvider defaultOpen={false}>{children}</SidebarProvider>
    </ChatLayoutProvider>
  );
}
