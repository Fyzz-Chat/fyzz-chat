"use client";

import {
  type GroupedMemories,
  TypedMemoryBrowser,
} from "@/components/settings/typed-memory-browser";

import {
  useDeleteProjectMemory,
  useProjectMemoriesGrouped,
} from "@/lib/queries/memories";
import { MemoryType } from "@/types/memory";

const EMPTY_MEMORIES: GroupedMemories = {
  [MemoryType.fact]: [],
  [MemoryType.opinion]: [],
  [MemoryType.learning]: [],
  [MemoryType.feedback]: [],
  [MemoryType.context]: [],
};

interface ProjectMemoriesProps {
  projectId: string;
  initialData?: GroupedMemories;
}

export function ProjectMemories({ projectId, initialData }: ProjectMemoriesProps) {
  const { data: memories, isPending } = useProjectMemoriesGrouped(projectId, initialData);
  const deleteMutation = useDeleteProjectMemory(projectId);

  return (
    <TypedMemoryBrowser
      memories={memories ?? EMPTY_MEMORIES}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      isDeleting={deleteMutation.isPending}
      isLoading={isPending}
    />
  );
}
