import { ProjectPage } from "@/components/projects/project-page";

export default async function ProjectPageRoute({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <ProjectPage id={id} />;
}
