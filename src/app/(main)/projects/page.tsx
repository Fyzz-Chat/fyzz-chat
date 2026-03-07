import { ProjectsListPage } from "@/components/projects/projects-list-page";
import { caller } from "@/lib/trpc/server";

export default async function ProjectsPage() {
  const { projects } = await caller.projects();

  return <ProjectsListPage initialProjects={projects} />;
}
