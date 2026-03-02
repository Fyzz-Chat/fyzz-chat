"use client";

import { useState } from "react";
import ChatSidebar from "@/components/sidebar/chat-sidebar";
import { ProjectsSection } from "@/components/sidebar/projects-section";
import { Separator } from "@/components/ui/separator";
import type { PartialConversation, ProjectWithCount } from "@/types/chat";

interface ChatSidebarWithProjectsProps {
  conversations: { items: PartialConversation[]; nextCursor: string | undefined };
  projects: { projects: ProjectWithCount[]; unassignedCount: number };
  authorized: boolean;
}

export function ChatSidebarWithProjects({
  conversations,
  projects,
  authorized,
}: ChatSidebarWithProjectsProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | null | "unassigned"
  >(null);

  // Filter conversations based on selected project
  const filteredConversations = {
    ...conversations,
    items: conversations.items.filter((c) => {
      if (selectedProjectId === null) {
        // Show all conversations
        return true;
      }
      if (selectedProjectId === "unassigned") {
        // Show only unassigned conversations
        return !c.projectId;
      }
      // Show conversations from selected project
      return c.projectId === selectedProjectId;
    }),
  };

  return (
    <>
      <ProjectsSection
        initialProjects={projects.projects}
        initialUnassignedCount={projects.unassignedCount}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
      />
      <div className="px-2">
        <Separator />
      </div>
      <ChatSidebar conversations={filteredConversations} authorized={authorized} />
    </>
  );
}
