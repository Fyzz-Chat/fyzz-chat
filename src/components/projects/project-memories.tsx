"use client";

import {
  type GroupedMemories,
  TypedMemoryBrowser,
} from "@/components/settings/typed-memory-browser";
import {
  useDeleteProjectMemory,
  useProjectMemoriesGrouped,
} from "@/lib/queries/memories";

interface ProjectMemoriesProps {
  projectId: string;
  initialMemories: GroupedMemories;
}

export function ProjectMemories({ projectId, initialMemories }: ProjectMemoriesProps) {
  const { data: memories = initialMemories } = useProjectMemoriesGrouped(
    projectId,
    initialMemories
  );
  const deleteMutation = useDeleteProjectMemory(projectId);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="font-medium text-sm">Memories</h3>
        <p className="text-muted-foreground text-xs">
          Information the AI remembers about this project.
        </p>
      </div>
      <TypedMemoryBrowser
        memories={memories}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
