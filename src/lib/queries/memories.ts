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
        (old: GroupedMemories | undefined) => {
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
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(trpc.userMemories.queryKey(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(trpc.userMemories.queryFilter());
    },
  });
}
