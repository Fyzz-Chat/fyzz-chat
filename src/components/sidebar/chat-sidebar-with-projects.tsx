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

  // Convert selection to API parameter:
  // - "All" (null) → undefined (no filter, show all)
  // - "Unassigned" → null (filter for unassigned only)
  // - Specific project → project ID string
  const projectIdForApi =
    selectedProjectId === "unassigned"
      ? null
      : selectedProjectId === null
        ? undefined
        : selectedProjectId;

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
      <ChatSidebar
        conversations={conversations}
        authorized={authorized}
        projectId={projectIdForApi}
      />
    </>
  );
}
