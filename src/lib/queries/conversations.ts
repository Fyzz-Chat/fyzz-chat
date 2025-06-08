import {
  deleteConversation,
  saveConversation,
  saveConversationModel,
} from "@/lib/actions/conversations";
import { useModelStore } from "@/stores/model-store";
import type { PartialConversation } from "@/types/chat";
import {
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
  list: (search?: string) => {
    const keys = ["conversations", "list"];
    if (search) {
      keys.push(search);
    }
    return keys;
  },
};

export function useConversations(
  conversations: any,
  search?: string,
  authorized?: boolean
) {
  return useInfiniteQuery({
    queryKey: conversationKeys.list(search),
    queryFn: async ({ pageParam = 1 }) => {
      const searchParams = new URLSearchParams({
        page: pageParam.toString(),
        limit: "15",
        ...(search ? { search } : {}),
      });

      if (!authorized) {
        return {
          conversations: [],
          nextPage: undefined,
        };
      }

      const response = await fetch(`/api/conversations?${searchParams.toString()}`);
      const data = await response.json();
      return {
        conversations: data.conversations,
        nextPage: data.hasMore ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    initialData: !search
      ? () => ({
          pages: [
            {
              conversations: conversations.conversations,
              nextPage: conversations.hasMore ? 1 : undefined,
            },
          ],
          pageParams: [1],
        })
      : undefined,
    placeholderData: (previousData) => previousData,
  });
}

export function useConversation(id: string, initialConversation?: any) {
  const { temporaryChat } = useModelStore();
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
  const { temporaryChat } = useModelStore();
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
    mutationFn: ({ conversationId, model }: { conversationId: string; model: string }) =>
      saveConversationModel(conversationId, model),
    onSuccess: (updatedConversation, { conversationId }) => {
      queryClient.setQueryData(conversationKeys.details(conversationId), (old: any) => ({
        ...old,
        model: updatedConversation?.model,
      }));
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId }: { conversationId: string }) =>
      deleteConversation(conversationId),
    onSuccess: (_, { conversationId }) => {
      // Update all conversation list caches (including filtered ones)
      const queries = queryClient.getQueriesData({ queryKey: ["conversations", "list"] });
      queries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old: any) => ({
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            conversations: page.conversations.filter(
              (conv: PartialConversation) => conv.id !== conversationId
            ),
          })),
        }));
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
      message: Message;
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

      // Update all conversation list caches (including filtered ones)
      const queries = queryClient.getQueriesData({ queryKey: ["conversations", "list"] });
      queries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              conversations: page.conversations.map((conv: PartialConversation) =>
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
      queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
    },
  });
}

export function useRegenerateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      conversationId,
    }: { messageId: string; conversationId: string }) =>
      deleteMessageChainAfter(messageId, conversationId),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.list() });

      queryClient.invalidateQueries({
        queryKey: conversationKeys.details(conversationId),
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

        // Get all conversation list queries
        const queries = queryClient.getQueriesData({
          queryKey: ["conversations", "list"],
        });
        queries.forEach(([queryKey]) => {
          // Only update the unfiltered list optimistically
          if (queryKey.length === 2) {
            // ["conversations", "list"]
            queryClient.setQueryData(queryKey, (old: any) => {
              if (!old) return old;
              return {
                ...old,
                pages: [
                  {
                    conversations: [
                      newConversation,
                      ...(old.pages[0]?.conversations || []),
                    ],
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
      queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
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
