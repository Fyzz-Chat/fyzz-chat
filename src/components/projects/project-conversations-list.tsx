"use client";

import Link from "next/link";
import { useConversations } from "@/lib/queries/conversations";
import type { ConversationPage } from "@/types/chat";

interface ProjectConversationsListProps {
  id: string;
  initialConversations: ConversationPage;
}

export function ProjectConversationsList({
  id,
  initialConversations,
}: Readonly<ProjectConversationsListProps>) {
  const { data: conversationsData } = useConversations(true, {
    initialData: initialConversations,
    projectId: id,
  });
  const conversations = conversationsData?.pages.flatMap((page) => page.items) ?? [];

  if (conversations.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No conversations yet. Send a message to start one.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/chat/${conversation.id}`}
          className="flex items-start justify-between gap-3 rounded-lg p-3 text-sm transition-colors hover:bg-muted"
        >
          <div className="min-w-0 flex-1">
            <div className="truncate">{conversation.title}</div>
          </div>
          <span className="shrink-0 text-muted-foreground text-xs">
            {new Date(conversation.lastMessageAt).toLocaleDateString()}
          </span>
        </Link>
      ))}
    </div>
  );
}
