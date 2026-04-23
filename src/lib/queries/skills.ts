import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSkill,
  deleteSkill,
  updateSkill,
  updateUserSkillsEnabled,
} from "@/lib/actions/skills";
import { useTRPC } from "@/lib/trpc/client";

type SkillItem = {
  id: string;
  name: string;
  description: string;
  content: string;
  enabled: boolean;
  lastActivatedAt: Date | null;
  userId: string;
  projectId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type SkillsData = SkillItem[] | undefined;

export function useSkills(initialData?: SkillItem[]) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.skills.queryOptions(),
    initialData,
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: (input: { name: string; description: string; content: string }) =>
      createSkill(input),
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries(trpc.skills.queryFilter());
      }
    },
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: (input: {
      id: string;
      data: Partial<{
        name: string;
        description: string;
        content: string;
        enabled: boolean;
      }>;
    }) => updateSkill(input.id, input.data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries(trpc.skills.queryFilter());
      const previous = queryClient.getQueryData(trpc.skills.queryKey());
      queryClient.setQueryData(trpc.skills.queryKey(), (old: SkillsData) =>
        old?.map((s) => (s.id === id ? { ...s, ...data } : s))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(trpc.skills.queryKey(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(trpc.skills.queryFilter());
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: (id: string) => deleteSkill(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries(trpc.skills.queryFilter());
      const previous = queryClient.getQueryData(trpc.skills.queryKey());
      queryClient.setQueryData(trpc.skills.queryKey(), (old: SkillsData) =>
        old?.filter((s) => s.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(trpc.skills.queryKey(), context.previous);
      }
    },
  });
}

export function useUpdateSkillsEnabled() {
  return useMutation({
    mutationFn: (enabled: boolean) => updateUserSkillsEnabled(enabled),
  });
}
