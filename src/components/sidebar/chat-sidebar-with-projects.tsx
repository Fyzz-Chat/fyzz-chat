import ChatSidebar from "@/components/sidebar/chat-sidebar";
import { ProjectsSection } from "@/components/sidebar/projects-section";
import { Separator } from "@/components/ui/separator";
import type { PartialConversation, ProjectWithCount } from "@/types/chat";

interface ChatSidebarWithProjectsProps {
  conversations: { items: PartialConversation[]; nextCursor: string | undefined };
  projects: { projects: ProjectWithCount[] };
  authorized: boolean;
}

export function ChatSidebarWithProjects({
  conversations,
  projects,
  authorized,
}: ChatSidebarWithProjectsProps) {
  return (
    <>
      <ProjectsSection initialProjects={projects.projects} />
      <div className="px-2">
        <Separator />
      </div>
      <ChatSidebar conversations={conversations} authorized={authorized} />
    </>
  );
}
