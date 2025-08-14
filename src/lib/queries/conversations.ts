import {
  deleteConversation,
  saveConversation,
  saveConversationModel,
} from "@/lib/actions/conversations";
import { useTRPC } from "@/lib/trpc/client";
import type { AppRouter } from "@/lib/trpc/routers/_app";
import { filterMessagesUpToAnchor } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import type { CustomUIMessage, PartialConversation } from "@/types/chat";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { inferReactQueryProcedureOptions } from "@trpc/react-query";
import { useCallback } from "react";
import { deleteMessageChainAfter } from "../actions/messages";

export function useConversations(
  conversations: any,
  authorized: boolean,
  search?: string
) {
  const temporaryChat = useModelStore((state) => state.temporaryChat);
  const trpc = useTRPC();

  const initialData = {
    pages: [conversations],
    pageParams: [null] as (string | null)[],
  };

  const myQuery = trpc.infiniteConversations.infiniteQueryOptions(
    {
      search: search,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialData: search ? undefined : initialData,
      placeholderData: keepPreviousData,
      enabled: authorized && !temporaryChat,
    }
  );

  return useInfiniteQuery(myQuery);
}

export function useConversation(id: string) {
  const temporaryChat = useModelStore((state) => state.temporaryChat);
  const trpc = useTRPC();

  const options: inferReactQueryProcedureOptions<AppRouter>["conversation"] = {
    enabled: !temporaryChat,
    meta: {
      persist: !temporaryChat,
    },
  };

  const myQuery = trpc.conversation.queryOptions({ id }, options);

  return useQuery(myQuery);
}

export function usePrefetchConversation() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useCallback(
    (id: string) => {
      queryClient.prefetchQuery(trpc.conversation.queryOptions({ id }));
      queryClient.prefetchQuery(trpc.messages.queryOptions({ id }));
    },
    [queryClient, trpc]
  );
}

export function useMessages(id: string) {
  const temporaryChat = useModelStore((state) => state.temporaryChat);
  const trpc = useTRPC();

  const options: inferReactQueryProcedureOptions<AppRouter>["messages"] = {
    enabled: !temporaryChat,
    meta: {
      persist: !temporaryChat,
    },
  };

  const myQuery = trpc.messages.queryOptions({ id }, options);

  return useQuery(myQuery);
}

export function useUpdateConversationModel() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: ({
      conversationId,
      model,
    }: { conversationId: string; model: string }) => {
      // Check if conversation exists in cache (indicates it was created in DB)
      const conversationExists = queryClient.getQueryData(
        trpc.conversation.queryKey({ id: conversationId })
      );

      if (!conversationExists) {
        // Conversation hasn't been created yet, skip the database update
        return Promise.resolve(null);
      }

      return saveConversationModel(conversationId, model);
    },
    onSuccess: (updatedConversation, { conversationId }) => {
      if (updatedConversation) {
        queryClient.setQueryData(
          trpc.conversation.queryKey({ id: conversationId }),
          (old: any) => ({
            ...old,
            model: updatedConversation.model,
          })
        );
      }
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: ({ conversationId }: { conversationId: string }) =>
      deleteConversation(conversationId),
    onSuccess: (_, { conversationId }) => {
      // Update tRPC infinite conversation caches
      const queries = queryClient.getQueriesData(
        trpc.infiniteConversations.infiniteQueryFilter()
      );
      queries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.filter(
                (conv: PartialConversation) => conv.id !== conversationId
              ),
            })),
          };
        });
      });
    },
  });
}

export function useAddMessage() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: async ({
      message,
      conversationId,
    }: {
      message: CustomUIMessage & { model?: string };
      conversationId: string;
    }) => {
      // Optimistically update the cache
      const optimisticMessage = {
        ...message,
        createdAt: new Date(),
      };

      // Update conversation detail cache
      queryClient.setQueryData(
        trpc.messages.queryKey({ id: conversationId }),
        (old: any) => {
          if (!old) return { messages: [optimisticMessage], hasMore: false };
          return {
            ...old,
            messages: [...(old.messages || []), optimisticMessage],
          };
        }
      );

      // Update tRPC infinite conversation caches
      const queries = queryClient.getQueriesData(
        trpc.infiniteConversations.infiniteQueryFilter()
      );
      queries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((conv: PartialConversation) =>
                conv.id === conversationId
                  ? {
                      ...conv,
                      messages: [...(conv.messages || []), optimisticMessage],
                    }
                  : conv
              ),
            })),
          };
        });
      });

      return optimisticMessage;
    },
    onError: (_, { conversationId }) => {
      // Revert optimistic updates on error
      queryClient.invalidateQueries(
        trpc.conversation.queryFilter({ id: conversationId })
      );
      queryClient.invalidateQueries(trpc.messages.queryFilter({ id: conversationId }));
      queryClient.invalidateQueries(trpc.infiniteConversations.infiniteQueryFilter());
    },
  });
}

export function useRegenerateMessage() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: ({
      messageId,
      conversationId,
      temporaryChat = false,
      newContent,
    }: {
      messageId: string;
      conversationId: string;
      temporaryChat?: boolean;
      newContent?: string;
    }) => {
      if (temporaryChat) {
        return Promise.resolve();
      }
      return deleteMessageChainAfter(messageId, conversationId, newContent);
    },
    onSuccess: (_, { conversationId, messageId, newContent }) => {
      queryClient.setQueryData(
        trpc.messages.queryKey({ id: conversationId }),
        (old: any) => {
          if (!old) return old;

          const filteredMessages = filterMessagesUpToAnchor(
            old.messages,
            messageId,
            newContent
          );
          return {
            messages: filteredMessages,
            hasMore: old.hasMore,
          };
        }
      );
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: (conversation: PartialConversation) => saveConversation(conversation),
    onSuccess: (newConversation) => {
      if (newConversation) {
        // Update conversation detail
        queryClient.setQueryData(
          trpc.conversation.queryKey({ id: newConversation.id }),
          newConversation
        );
        queryClient.setQueryData(trpc.messages.queryKey({ id: newConversation.id }), {
          messages: newConversation.messages,
          hasMore: false,
        });

        // Get all tRPC infinite conversation queries
        const queries = queryClient.getQueriesData(
          trpc.infiniteConversations.infiniteQueryFilter()
        );
        queries.forEach(([queryKey]) => {
          const key = queryKey as any[];
          // Only update unfiltered list optimistically (no search param)
          if (!key[1]?.input?.search) {
            queryClient.setQueryData(queryKey, (old: any) => {
              if (!old) return old;
              return {
                ...old,
                pages: [
                  {
                    items: [newConversation, ...(old.pages[0]?.items || [])],
                    nextCursor: old.pages[0]?.nextCursor,
                  },
                  ...old.pages.slice(1),
                ],
              };
            });
          } else {
            // Invalidate filtered queries to trigger a refetch
            queryClient.invalidateQueries({ queryKey });
          }
        });
      }
    },
    onError: (error, newConversation) => {
      console.error("Error creating conversation:", error);
      queryClient.invalidateQueries(
        trpc.conversation.queryFilter({ id: newConversation.id })
      );
      queryClient.invalidateQueries(
        trpc.messages.queryFilter({ id: newConversation.id })
      );
      queryClient.invalidateQueries(trpc.infiniteConversations.infiniteQueryFilter());
    },
  });
}
export function useCreateConversationOptimistic() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: async (conversation: PartialConversation) => {
      queryClient.setQueryData(
        trpc.conversation.queryKey({ id: conversation.id }),
        conversation
      );
      queryClient.setQueryData(trpc.messages.queryKey({ id: conversation.id }), {
        messages: conversation.messages,
        hasMore: false,
      });
    },
  });
}
