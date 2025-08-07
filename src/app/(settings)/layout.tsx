import { ChatLayoutProvider } from "@/components/chat/chat-layout-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import type React from "react";

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
