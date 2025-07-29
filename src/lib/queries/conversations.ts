import {
  deleteConversation,
  saveConversation,
  saveConversationModel,
} from "@/lib/actions/conversations";
import { useTRPC } from "@/lib/trpc/client";
import { filterMessagesUpToAnchor } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import type { PartialConversation } from "@/types/chat";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Message } from "ai";
import { deleteMessageChainAfter } from "../actions/messages";
import { processMessages } from "../message-processor";

export const conversationKeys = {
  details: (id: string) => ["conversations", id, "details"] as const,
  messages: (id: string) => ["conversations", id, "messages"] as const,
  list: () => ({
    predicate: (query: any) => {
      const key = query.queryKey as any[];
      return key[0]?.[0] === "infiniteConversations";
    },
  }),
};

export function useConversations(
  conversations: any,
  authorized: boolean,
  search?: string
) {
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
      enabled: authorized,
    }
  );

  return useInfiniteQuery(myQuery);
}

export function useConversation(id: string, initialConversation?: any) {
  const temporaryChat = useModelStore((state) => state.temporaryChat);
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: conversationKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      if (temporaryChat) {
        return queryClient.getQueryData<any>(conversationKeys.details(id));
      }

      const response = await fetch(`/api/conversations/${id}`);
      const data = await response.json();

      return data;
    },
    initialData: () => {
      if (initialConversation) {
        return initialConversation;
      }
      return null;
    },
    refetchOnMount: !temporaryChat,
    refetchOnWindowFocus: !temporaryChat,
    refetchOnReconnect: !temporaryChat,
  });
}

export function useMessages(id: string, initialMessages?: any) {
  const temporaryChat = useModelStore((state) => state.temporaryChat);
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: conversationKeys.messages(id),
    queryFn: async () => {
      if (temporaryChat) {
        return queryClient.getQueryData<any>(conversationKeys.messages(id));
      }

      const response = await fetch(`/api/conversations/${id}/messages`);
      const data = await response.json();

      if (data.messages.length === 0) {
        return queryClient.getQueryData<any>(conversationKeys.messages(id));
      }

      return processMessages(data.messages);
    },
    initialData: () => {
      if (initialMessages) {
        return initialMessages;
      }
      return null;
    },
    refetchOnMount: !temporaryChat,
    refetchOnWindowFocus: !temporaryChat,
    refetchOnReconnect: !temporaryChat,
  });
}

export function useUpdateConversationModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      model,
    }: { conversationId: string; model: string }) => {
      // Check if conversation exists in cache (indicates it was created in DB)
      const conversationExists = queryClient.getQueryData(
        conversationKeys.details(conversationId)
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
          conversationKeys.details(conversationId),
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

  return useMutation({
    mutationFn: ({ conversationId }: { conversationId: string }) =>
      deleteConversation(conversationId),
    onSuccess: (_, { conversationId }) => {
      // Update tRPC infinite conversation caches
      const queries = queryClient.getQueriesData(conversationKeys.list());
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

  return useMutation({
    mutationFn: async ({
      message,
      conversationId,
    }: {
      message: Message & { model?: string };
      conversationId: string;
    }) => {
      // Optimistically update the cache
      const optimisticMessage = {
        ...message,
        createdAt: message.createdAt || new Date(),
      };

      // Update conversation detail cache
      queryClient.setQueryData(conversationKeys.messages(conversationId), (old: any) => [
        ...(old || []),
        optimisticMessage,
      ]);

      // Update tRPC infinite conversation caches
      const queries = queryClient.getQueriesData(conversationKeys.list());
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
                      lastMessageAt: optimisticMessage.createdAt,
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
      queryClient.invalidateQueries({
        queryKey: conversationKeys.details(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.messages(conversationId),
      });
      queryClient.invalidateQueries(conversationKeys.list());
    },
  });
}

export function useRegenerateMessage() {
  const queryClient = useQueryClient();

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
      queryClient.setQueryData(conversationKeys.messages(conversationId), (old: any) => {
        if (!old) return old;

        return filterMessagesUpToAnchor(old, messageId, newContent);
      });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversation: PartialConversation) => saveConversation(conversation),
    onSuccess: (newConversation) => {
      if (newConversation) {
        // Update conversation detail
        queryClient.setQueryData(
          conversationKeys.details(newConversation.id),
          newConversation
        );
        queryClient.setQueryData(
          conversationKeys.messages(newConversation.id),
          newConversation.messages
        );

        // Get all tRPC infinite conversation queries
        const queries = queryClient.getQueriesData(conversationKeys.list());
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
      queryClient.invalidateQueries({
        queryKey: conversationKeys.details(newConversation.id),
      });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.messages(newConversation.id),
      });
      queryClient.invalidateQueries(conversationKeys.list());
    },
  });
}
export function useCreateConversationOptimistic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversation: PartialConversation) => {
      queryClient.setQueryData(conversationKeys.details(conversation.id), conversation);
      queryClient.setQueryData(
        conversationKeys.messages(conversation.id),
        conversation.messages
      );
    },
  });
}
