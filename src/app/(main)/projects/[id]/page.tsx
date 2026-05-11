import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import ChatInput from "@/components/chat/chat-input";
import { ProjectConversationsList } from "@/components/projects/project-conversations-list";
import ProjectHandlers from "@/components/projects/project-handlers";
import ProjectHeader from "@/components/projects/project-header";
import { ProjectMemories } from "@/components/projects/project-memories";
import {
  ConversationsListSkeleton,
  MemoriesSkeleton,
  SkillsSkeleton,
} from "@/components/projects/project-page-skeletons";
import { ProjectSkills } from "@/components/projects/project-skills";
import { Skeleton } from "@/components/ui/skeleton";
import { caller } from "@/lib/trpc/server";

async function ProjectHeaderLoader({ id }: Readonly<{ id: string }>) {
  const project = await caller.project({ id });
  return <ProjectHeader id={id} initialProject={project} />;
}

async function ProjectConversationsLoader({ id }: Readonly<{ id: string }>) {
  const conversations = await caller.infiniteConversations({
    limit: 15,
    search: "",
    projectId: id,
  });
  return <ProjectConversationsList id={id} initialConversations={conversations} />;
}

async function ProjectMemoriesLoader({ id }: Readonly<{ id: string }>) {
  const memories = await caller.projectMemoriesGrouped({ projectId: id });
  return <ProjectMemories projectId={id} initialData={memories} />;
}

async function ProjectSkillsLoader({ id }: Readonly<{ id: string }>) {
  const skills = await caller.projectSkills({ projectId: id });
  return <ProjectSkills projectId={id} initialData={skills} />;
}

function ProjectHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-5 w-3/4" />
    </div>
  );
}

export default async function ProjectPageRoute({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;

  return (
    <div className="mx-auto flex w-full min-w-0 flex-col items-center justify-center gap-8 overflow-x-hidden p-4 pt-16 lg:flex-row lg:items-start">
      <div className="flex h-full w-full min-w-0 max-w-2xl flex-col gap-6">
        <Link
          href="/projects"
          className="group flex items-center gap-1 text-muted-foreground text-sm transition-color duration-200 hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:translate-x-[-2px]" />
          Back to projects
        </Link>
        <Suspense fallback={<ProjectHeaderSkeleton />}>
          <ProjectHeaderLoader id={id} />
        </Suspense>
        <ProjectHandlers id={id} />
        <ChatInput />
        <Suspense fallback={<ConversationsListSkeleton />}>
          <ProjectConversationsLoader id={id} />
        </Suspense>
      </div>
      <aside className="flex h-fit w-full max-w-2xl flex-col gap-6 rounded-lg border p-6 lg:mt-12 lg:w-96 lg:shrink-0">
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="font-medium text-sm">Memories</h3>
            <p className="text-muted-foreground text-xs">
              Information the AI remembers about this project.
            </p>
          </div>
          <Suspense fallback={<MemoriesSkeleton />}>
            <ProjectMemoriesLoader id={id} />
          </Suspense>
        </div>
        <Suspense fallback={<SkillsSkeleton />}>
          <ProjectSkillsLoader id={id} />
        </Suspense>
      </aside>
    </div>
  );
}
