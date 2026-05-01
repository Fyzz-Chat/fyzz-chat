import { Suspense } from "react";
import { ProjectsListPage } from "@/components/projects/projects-list-page";
import { Skeleton } from "@/components/ui/skeleton";
import { caller } from "@/lib/trpc/server";

const PROJECT_SKELETON_KEYS = ["p1", "p2", "p3", "p4"];

export default function ProjectsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 pt-12 md:p-8 md:pt-12">
      <h1 className="font-semibold text-2xl">Projects</h1>
      <Suspense fallback={<ProjectsGridSkeleton />}>
        <ProjectsLoader />
      </Suspense>
    </div>
  );
}

async function ProjectsLoader() {
  const { projects } = await caller.projects();
  return <ProjectsListPage initialProjects={projects} />;
}

function ProjectsGridSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PROJECT_SKELETON_KEYS.map((key) => (
        <Skeleton key={key} className="h-36 w-full rounded-xl" />
      ))}
    </div>
  );
}
