import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  GroupedMemories,
  MemoryItem,
} from "@/components/settings/typed-memory-browser";
import { deleteMemoryAction } from "@/lib/actions/projects";
import { useTRPC } from "@/lib/trpc/client";
import { MemoryType } from "@/types/memory";

export function useUserMemories(initialData?: GroupedMemories) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.userMemories.queryOptions(),
    initialData,
    refetchOnMount: "always",
  });
}

function removeMemoryFromGrouped(
  old: GroupedMemories | undefined,
  id: string
): GroupedMemories | undefined {
  if (!old) return old;
  const next: GroupedMemories = {
    [MemoryType.fact]: [],
    [MemoryType.opinion]: [],
    [MemoryType.learning]: [],
    [MemoryType.context]: [],
    [MemoryType.feedback]: [],
  };
  for (const type of Object.keys(old) as MemoryType[]) {
    next[type] = (old[type] ?? []).filter((m: MemoryItem) => m.id !== id);
  }
  return next;
}

export function useDeleteUserMemory() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: (id: string) => deleteMemoryAction(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries(trpc.userMemories.queryFilter());
      const previous = queryClient.getQueryData(trpc.userMemories.queryKey());
      queryClient.setQueryData(
        trpc.userMemories.queryKey(),
        (old: GroupedMemories | undefined) => removeMemoryFromGrouped(old, id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(trpc.userMemories.queryKey(), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries(trpc.userMemories.queryFilter());
    },
  });
}

export function useProjectMemoriesGrouped(
  projectId: string,
  initialData?: GroupedMemories
) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.projectMemoriesGrouped.queryOptions({ projectId }),
    initialData,
    refetchOnMount: "always",
  });
}

export function useDeleteProjectMemory(projectId: string) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: (id: string) => deleteMemoryAction(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries(
        trpc.projectMemoriesGrouped.queryFilter({ projectId })
      );
      const previous = queryClient.getQueryData(
        trpc.projectMemoriesGrouped.queryKey({ projectId })
      );
      queryClient.setQueryData(
        trpc.projectMemoriesGrouped.queryKey({ projectId }),
        (old: GroupedMemories | undefined) => removeMemoryFromGrouped(old, id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          trpc.projectMemoriesGrouped.queryKey({ projectId }),
          context.previous
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries(
        trpc.projectMemoriesGrouped.queryFilter({ projectId })
      );
    },
  });
}
