"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteMemoryAction } from "@/lib/actions/projects";
import { useTRPC } from "@/lib/trpc/client";

interface ProjectMemoriesProps {
  projectId: string;
  initialMemories?: { id: string; content: string; createdAt: Date }[];
}

export function ProjectMemories({ projectId, initialMemories }: ProjectMemoriesProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const { data: memories } = useQuery({
    ...trpc.projectMemories.queryOptions({ projectId }),
    initialData: initialMemories,
    refetchOnMount: "always",
  });

  function onDelete(memoryId: string) {
    startTransition(async () => {
      queryClient.setQueryData(
        trpc.projectMemories.queryKey({ projectId }),
        (old: typeof memories) => old?.filter((m) => m.id !== memoryId)
      );
      await deleteMemoryAction(memoryId);
      await queryClient.invalidateQueries(
        trpc.projectMemories.queryFilter({ projectId })
      );
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="font-medium text-sm">Memories</h3>
        <p className="text-muted-foreground text-xs">
          Information the AI remembers about this project.
        </p>
      </div>
      {memories?.length ? (
        <ul className="flex flex-col gap-2">
          {memories.map((memory) => (
            <li
              key={memory.id}
              className="group flex items-start gap-2 border-b p-2 last:border-b-0"
            >
              <p className="min-w-0 flex-1 text-sm">{memory.content}</p>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => onDelete(memory.id)}
                disabled={isPending}
              >
                <X className="size-3" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-xs italic">
          No memories yet. The AI will store relevant information here during
          conversations.
        </p>
      )}
    </div>
  );
}
