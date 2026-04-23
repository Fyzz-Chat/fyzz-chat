import { Suspense } from "react";
import { ProjectConversationsList } from "@/components/projects/project-conversations-list";
import { ProjectMemories } from "@/components/projects/project-memories";
import { ProjectInfo } from "@/components/projects/project-page";
import {
  ConversationsListSkeleton,
  MemoriesSkeleton,
  SkillsSkeleton,
} from "@/components/projects/project-page-skeletons";
import { ProjectSkills } from "@/components/projects/project-skills";
import { caller } from "@/lib/trpc/server";

async function ProjectConversationsLoader({ id }: Readonly<{ id: string }>) {
  const conversations = await caller.infiniteConversations({
    limit: 15,
    search: "",
    projectId: id,
  });
  return <ProjectConversationsList id={id} initialConversations={conversations} />;
}

async function ProjectMemoriesLoader({ id }: Readonly<{ id: string }>) {
  const memories = await caller.projectMemories({ projectId: id });
  return <ProjectMemories projectId={id} initialMemories={memories} />;
}

async function ProjectSkillsLoader({ id }: Readonly<{ id: string }>) {
  const skills = await caller.projectSkills({ projectId: id });
  return <ProjectSkills projectId={id} initialSkills={skills} />;
}

export default async function ProjectPageRoute({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const project = await caller.project({ id });

  return (
    <div className="mx-auto flex w-full min-w-0 flex-col items-center justify-center gap-8 overflow-x-hidden p-4 pt-16 lg:flex-row lg:items-start">
      <div className="flex h-full w-full min-w-0 max-w-2xl flex-col gap-6">
        <ProjectInfo id={id} initialProject={project} />
        <Suspense fallback={<ConversationsListSkeleton />}>
          <ProjectConversationsLoader id={id} />
        </Suspense>
      </div>
      <aside className="flex h-fit w-full max-w-2xl flex-col gap-6 rounded-lg border p-6 lg:mt-12 lg:w-96 lg:shrink-0">
        <Suspense fallback={<MemoriesSkeleton />}>
          <ProjectMemoriesLoader id={id} />
        </Suspense>
        <Suspense fallback={<SkillsSkeleton />}>
          <ProjectSkillsLoader id={id} />
        </Suspense>
      </aside>
    </div>
  );
}
