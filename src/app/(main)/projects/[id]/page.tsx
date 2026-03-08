import { ProjectPage } from "@/components/projects/project-page";
import { caller } from "@/lib/trpc/server";

export default async function ProjectPageRoute({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const [project, conversations, memories] = await Promise.all([
    caller.project({ id }),
    caller.infiniteConversations({ limit: 15, search: "", projectId: id }),
    caller.projectMemories({ projectId: id }),
  ]);

  return (
    <ProjectPage
      id={id}
      initialProject={project}
      initialConversations={conversations}
      initialMemories={memories}
    />
  );
}
