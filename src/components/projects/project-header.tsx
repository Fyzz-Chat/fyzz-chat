"use client";

import { useProject } from "@/lib/queries/projects";

interface ProjectHeaderProps {
  id: string;
  initialProject?: { id: string; name: string; description: string | null } | null;
}

export default function ProjectHeader({
  id,
  initialProject,
}: Readonly<ProjectHeaderProps>) {
  const { data: project } = useProject(id, initialProject);

  if (!project) {
    return <p className="text-muted-foreground text-sm">Project not found</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-semibold text-2xl">{project.name}</h1>
      {project.description ? (
        <p className="text-muted-foreground text-sm">{project.description}</p>
      ) : null}
    </div>
  );
}
