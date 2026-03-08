import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignConversationToProjectAction,
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/lib/actions/projects";
import { useTRPC } from "@/lib/trpc/client";
import type { PartialConversation, ProjectWithCount } from "@/types/chat";

type ProjectData = { id: string; name: string; description: string | null } | null;
type ProjectsData = { projects: ProjectWithCount[] };
type ConversationData = {
  id: string;
  title: string;
  model: string;
  projectId: string | null;
} | null;
type ConversationListInput = { search?: string; projectId?: string | null };
type ConversationsCache = {
  pages: Array<{ items: PartialConversation[]; nextCursor: string | undefined }>;
  pageParams: (string | null)[];
};

type CreateProjectContext = {
  optimisticId: string;
  previousProjects: ProjectsData | undefined;
};

type UpdateProjectContext = {
  previousProjects: ProjectsData | undefined;
  previousProject: ProjectData | undefined;
};

type DeleteProjectContext = {
  previousProjects: ProjectsData | undefined;
  previousProject: ProjectData | undefined;
};

type AssignProjectContext = {
  previousProjects: ProjectsData | undefined;
  previousConversation: ConversationData | undefined;
  previousConversationLists: Array<[unknown, ConversationsCache | undefined]>;
};

function sortProjects(projects: ProjectWithCount[]) {
  return [...projects].sort((a, b) => a.name.localeCompare(b.name));
}

function toProjectWithCount(
  project: {
    id: string;
    name: string;
    description?: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  },
  overrides?: Partial<ProjectWithCount>
): ProjectWithCount {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? null,
    userId: project.userId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    conversationCount: 0,
    lastActivityAt: project.updatedAt,
    ...overrides,
  };
}

function getConversationListInput(queryKey: unknown): ConversationListInput {
  if (!Array.isArray(queryKey)) {
    return {};
  }

  const keyPart = queryKey[1];
  if (!keyPart || typeof keyPart !== "object") {
    return {};
  }

  const input = (keyPart as { input?: ConversationListInput }).input;
  if (!input || typeof input !== "object") {
    return {};
  }

  return input;
}

function matchesConversationFilter(
  input: ConversationListInput,
  projectId: string | null
) {
  if (input.projectId === undefined) {
    return true;
  }

  return input.projectId === projectId;
}

function setProjectsCache(
  queryClient: ReturnType<typeof useQueryClient>,
  trpc: ReturnType<typeof useTRPC>,
  updater: (old: ProjectsData | undefined) => ProjectsData | undefined
) {
  queryClient.setQueryData(trpc.projects.queryKey(), updater);
}

function setProjectCache(
  queryClient: ReturnType<typeof useQueryClient>,
  trpc: ReturnType<typeof useTRPC>,
  id: string,
  updater: (old: ProjectData | undefined) => ProjectData | undefined
) {
  queryClient.setQueryData(trpc.project.queryKey({ id }), updater);
}

export function updateProjectCounts(
  queryClient: ReturnType<typeof useQueryClient>,
  trpc: ReturnType<typeof useTRPC>,
  fromProjectId: string | null | undefined,
  toProjectId: string | null,
  activityAt?: Date
) {
  if (fromProjectId === toProjectId) {
    return;
  }

  setProjectsCache(queryClient, trpc, (old) => {
    if (!old) return old;

    return {
      ...old,
      projects: old.projects.map((project) => {
        let nextProject = project;

        if (fromProjectId && project.id === fromProjectId) {
          nextProject = {
            ...nextProject,
            conversationCount: Math.max(0, nextProject.conversationCount - 1),
          };
        }

        if (toProjectId && project.id === toProjectId) {
          nextProject = {
            ...nextProject,
            conversationCount: nextProject.conversationCount + 1,
            lastActivityAt:
              activityAt && activityAt > nextProject.lastActivityAt
                ? activityAt
                : nextProject.lastActivityAt,
          };
        }

        return nextProject;
      }),
    };
  });
}

function findConversationInCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  trpc: ReturnType<typeof useTRPC>,
  conversationId: string
) {
  const conversationLists = queryClient.getQueriesData(
    trpc.infiniteConversations.infiniteQueryFilter()
  ) as Array<[unknown, ConversationsCache | undefined]>;

  for (const [, data] of conversationLists) {
    if (!data) continue;

    for (const page of data.pages) {
      const conversation = page.items.find((item) => item.id === conversationId);
      if (conversation) {
        return conversation;
      }
    }
  }

  return undefined;
}

function getConversationProjectId(
  queryClient: ReturnType<typeof useQueryClient>,
  trpc: ReturnType<typeof useTRPC>,
  conversationId: string
) {
  const conversation = findConversationInCaches(queryClient, trpc, conversationId);
  if (conversation) {
    return conversation.projectId;
  }

  const conversationDetail = queryClient.getQueryData(
    trpc.conversation.queryKey({ id: conversationId })
  ) as ConversationData | undefined;

  return conversationDetail?.projectId;
}

function updateConversationProjectCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  trpc: ReturnType<typeof useTRPC>,
  conversationId: string,
  projectId: string | null
) {
  const sourceConversation = findConversationInCaches(queryClient, trpc, conversationId);
  const nextConversation = sourceConversation
    ? { ...sourceConversation, projectId }
    : undefined;

  const conversationLists = queryClient.getQueriesData(
    trpc.infiniteConversations.infiniteQueryFilter()
  ) as Array<[unknown, ConversationsCache | undefined]>;

  conversationLists.forEach(([queryKey]) => {
    const input = getConversationListInput(queryKey);
    const shouldContainConversation = matchesConversationFilter(input, projectId);
    const canInsert = !input.search;

    queryClient.setQueryData(
      queryKey as readonly unknown[],
      (old: ConversationsCache | undefined) => {
        if (!old) return old;

        let foundConversation = false;
        const pages = old.pages.map((page) => ({
          ...page,
          items: page.items.flatMap((item) => {
            if (item.id !== conversationId) {
              return [item];
            }

            foundConversation = true;
            if (!shouldContainConversation) {
              return [];
            }

            return [{ ...item, projectId }];
          }),
        }));

        if (
          !foundConversation &&
          canInsert &&
          shouldContainConversation &&
          nextConversation &&
          pages[0]
        ) {
          pages[0] = {
            ...pages[0],
            items: [nextConversation, ...pages[0].items],
          };
        }

        return {
          ...old,
          pages,
        };
      }
    );
  });

  queryClient.setQueryData(
    trpc.conversation.queryKey({ id: conversationId }),
    (old: ConversationData | undefined) => {
      if (!old) return old;
      return {
        ...old,
        projectId,
      };
    }
  );
}

function restoreConversationLists(
  queryClient: ReturnType<typeof useQueryClient>,
  snapshots: Array<[unknown, ConversationsCache | undefined]>
) {
  snapshots.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey as readonly unknown[], data);
  });
}

export function useProject(id: string, initialData?: ProjectData | null) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.project.queryOptions({ id }),
    initialData: initialData ?? undefined,
  });
}

export function useProjects(initialData?: { projects: ProjectWithCount[] }) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.projects.queryOptions(),
    initialData,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string | null }) =>
      createProjectAction(name, description),
    onMutate: async ({ name, description }): Promise<CreateProjectContext> => {
      await queryClient.cancelQueries(trpc.projects.queryFilter());

      const previousProjects = queryClient.getQueryData(trpc.projects.queryKey());

      const optimisticId = `optimistic-project-${Date.now()}`;
      const now = new Date();

      setProjectsCache(queryClient, trpc, (old) => {
        const optimisticProject = toProjectWithCount(
          {
            id: optimisticId,
            name,
            description: description ?? null,
            userId: old?.projects[0]?.userId ?? "",
            createdAt: now,
            updatedAt: now,
          },
          {
            conversationCount: 0,
            lastActivityAt: now,
          }
        );

        if (!old) {
          return { projects: [optimisticProject] };
        }

        return {
          ...old,
          projects: sortProjects([...old.projects, optimisticProject]),
        };
      });

      return { optimisticId, previousProjects };
    },
    onError: (_, __, context) => {
      if (!context) return;
      queryClient.setQueryData(trpc.projects.queryKey(), context.previousProjects);
    },
    onSuccess: (project, _, context) => {
      setProjectsCache(queryClient, trpc, (old) => {
        const nextProject = toProjectWithCount(project);

        if (!old) {
          return { projects: [nextProject] };
        }

        return {
          ...old,
          projects: sortProjects([
            ...old.projects.filter((item) => item.id !== context?.optimisticId),
            nextProject,
          ]),
        };
      });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: ({
      id,
      name,
      description,
    }: {
      id: string;
      name: string;
      description?: string | null;
    }) => updateProjectAction(id, name, description),
    onMutate: async ({ id, name, description }): Promise<UpdateProjectContext> => {
      await queryClient.cancelQueries(trpc.projects.queryFilter());
      await queryClient.cancelQueries(trpc.project.queryFilter({ id }));

      const previousProjects = queryClient.getQueryData(trpc.projects.queryKey());
      const previousProject = queryClient.getQueryData(trpc.project.queryKey({ id })) as
        | ProjectData
        | undefined;

      setProjectsCache(queryClient, trpc, (old) => {
        if (!old) return old;

        return {
          ...old,
          projects: sortProjects(
            old.projects.map((project) =>
              project.id === id
                ? {
                    ...project,
                    name,
                    ...(description !== undefined && { description }),
                  }
                : project
            )
          ),
        };
      });

      setProjectCache(queryClient, trpc, id, (old) => {
        if (!old) return old;
        return {
          ...old,
          name,
          ...(description !== undefined && { description }),
        };
      });

      return { previousProjects, previousProject };
    },
    onError: (_, variables, context) => {
      if (!context) return;
      queryClient.setQueryData(trpc.projects.queryKey(), context.previousProjects);
      queryClient.setQueryData(
        trpc.project.queryKey({ id: variables.id }),
        context.previousProject
      );
    },
    onSuccess: (project) => {
      setProjectsCache(queryClient, trpc, (old) => {
        if (!old) return old;

        return {
          ...old,
          projects: sortProjects(
            old.projects.map((item) =>
              item.id === project.id
                ? {
                    ...item,
                    name: project.name,
                    description: project.description,
                    updatedAt: project.updatedAt,
                  }
                : item
            )
          ),
        };
      });

      setProjectCache(queryClient, trpc, project.id, (old) => {
        if (!old) return old;
        return {
          ...old,
          name: project.name,
          description: project.description,
        };
      });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: (id: string) => deleteProjectAction(id),
    onMutate: async (id): Promise<DeleteProjectContext> => {
      await queryClient.cancelQueries(trpc.projects.queryFilter());
      await queryClient.cancelQueries(trpc.project.queryFilter({ id }));

      const previousProjects = queryClient.getQueryData(trpc.projects.queryKey());
      const previousProject = queryClient.getQueryData(trpc.project.queryKey({ id })) as
        | ProjectData
        | undefined;

      setProjectsCache(queryClient, trpc, (old) => {
        if (!old) return old;
        return {
          ...old,
          projects: old.projects.filter((project) => project.id !== id),
        };
      });

      queryClient.setQueryData(trpc.project.queryKey({ id }), null);

      return {
        previousProjects,
        previousProject,
      };
    },
    onError: (_, variables, context) => {
      if (!context) return;
      queryClient.setQueryData(trpc.projects.queryKey(), context.previousProjects);
      queryClient.setQueryData(
        trpc.project.queryKey({ id: variables }),
        context.previousProject
      );
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
    onMutate: async ({ conversationId, projectId }): Promise<AssignProjectContext> => {
      await queryClient.cancelQueries(trpc.projects.queryFilter());
      await queryClient.cancelQueries(
        trpc.conversation.queryFilter({ id: conversationId })
      );
      await queryClient.cancelQueries(trpc.infiniteConversations.infiniteQueryFilter());

      const previousProjects = queryClient.getQueryData(trpc.projects.queryKey());
      const previousConversation = queryClient.getQueryData(
        trpc.conversation.queryKey({ id: conversationId })
      ) as ConversationData | undefined;
      const previousConversationLists = queryClient.getQueriesData(
        trpc.infiniteConversations.infiniteQueryFilter()
      ) as Array<[unknown, ConversationsCache | undefined]>;

      const previousProjectId = getConversationProjectId(
        queryClient,
        trpc,
        conversationId
      );
      const sourceConversation = findConversationInCaches(
        queryClient,
        trpc,
        conversationId
      );

      updateConversationProjectCaches(queryClient, trpc, conversationId, projectId);
      updateProjectCounts(
        queryClient,
        trpc,
        previousProjectId,
        projectId,
        sourceConversation?.lastMessageAt
      );

      return {
        previousProjects,
        previousConversation,
        previousConversationLists,
      };
    },
    onError: (_, variables, context) => {
      if (!context) return;

      queryClient.setQueryData(trpc.projects.queryKey(), context.previousProjects);
      queryClient.setQueryData(
        trpc.conversation.queryKey({ id: variables.conversationId }),
        context.previousConversation
      );
      restoreConversationLists(queryClient, context.previousConversationLists);
    },
    onSuccess: (updatedConversation, { conversationId }) => {
      queryClient.setQueryData(
        trpc.conversation.queryKey({ id: conversationId }),
        (old: ConversationData | undefined) => {
          if (!old) return old;
          return {
            ...old,
            projectId: updatedConversation.projectId,
          };
        }
      );
    },
  });
}
