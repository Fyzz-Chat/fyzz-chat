import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignConversationToProjectAction,
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/lib/actions/projects";
import { useTRPC } from "@/lib/trpc/client";
import type { PartialConversation, ProjectWithCount } from "@/types/chat";

export function useProject(id: string) {
  const trpc = useTRPC();

  return useQuery(trpc.project.queryOptions({ id }));
}

export function useProjects(initialData?: { projects: ProjectWithCount[] }) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.projects.queryOptions(),
    initialData,
  });
}

export function useUnassignedConversationsCount() {
  const trpc = useTRPC();

  return useQuery(trpc.unassignedConversationsCount.queryOptions());
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: (name: string) => createProjectAction(name),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.projects.queryFilter());
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateProjectAction(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.projects.queryFilter());
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: (id: string) => deleteProjectAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.projects.queryFilter());
      // Also invalidate conversations since they may have been unassigned
      queryClient.invalidateQueries(trpc.infiniteConversations.queryFilter());
      queryClient.invalidateQueries(trpc.unassignedConversationsCount.queryFilter());
    },
  });
}

export function useAssignConversationToProject() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: ({
      conversationId,
      projectId,
    }: {
      conversationId: string;
      projectId: string | null;
    }) => assignConversationToProjectAction(conversationId, projectId),
    onSuccess: (_, { conversationId, projectId }) => {
      // Update conversation cache optimistically for current view
      const queries = queryClient.getQueriesData(
        trpc.infiniteConversations.infiniteQueryFilter()
      );

      queries.forEach(([queryKey]) => {
        queryClient.setQueryData(
          queryKey,
          (old: { pages: Array<{ items: PartialConversation[] }> } | undefined) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                items: page.items.map((conv: PartialConversation) =>
                  conv.id === conversationId ? { ...conv, projectId } : conv
                ),
              })),
            };
          }
        );
      });

      // Invalidate all conversation queries to ensure filtered views are updated
      queryClient.invalidateQueries(trpc.infiniteConversations.infiniteQueryFilter());

      // Invalidate project counts
      queryClient.invalidateQueries(trpc.projects.queryFilter());
      queryClient.invalidateQueries(trpc.unassignedConversationsCount.queryFilter());
    },
  });
}
