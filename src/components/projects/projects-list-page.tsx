"use client";

import { Folder, MessageSquare } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProjects } from "@/lib/queries/projects";
import { formatTimeAgo } from "@/lib/utils";
import type { ProjectWithCount } from "@/types/chat";

interface ProjectsListPageProps {
  initialProjects: ProjectWithCount[];
}

export function ProjectsListPage({ initialProjects }: Readonly<ProjectsListPageProps>) {
  const { data: projectsData } = useProjects({ projects: initialProjects });
  const projects = projectsData?.projects ?? initialProjects;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 pt-12 md:p-8 md:pt-12">
      <h1 className="font-semibold text-2xl">Projects</h1>

      {projects.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No projects yet. Create one from the sidebar.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Folder className="size-4 text-muted-foreground" />
                    <CardTitle className="truncate text-base">{project.name}</CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <MessageSquare className="size-3" />
                    {project.conversationCount}{" "}
                    {project.conversationCount === 1 ? "conversation" : "conversations"}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="text-muted-foreground text-xs">
                  Updated{" "}
                  {formatTimeAgo(new Date(project.lastActivityAt || project.updatedAt))}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
