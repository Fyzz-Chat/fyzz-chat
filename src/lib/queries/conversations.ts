import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { inferReactQueryProcedureOptions } from "@trpc/react-query";
import { useCallback } from "react";
import {
  branchConversationAction,
  deleteConversation,
  saveConversation,
  saveConversationModel,
  shareConversationUntilMessage,
} from "@/lib/actions/conversations";
import { deleteMessageChainAfter } from "@/lib/actions/messages";
import { deleteShareAction } from "@/lib/actions/shares";
import { useTRPC } from "@/lib/trpc/client";
import type { AppRouter } from "@/lib/trpc/routers/_app";
import { filterMessagesUpToAnchor } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import type {
  ConversationData,
  ConversationPage,
  ConversationsInfiniteData,
  CustomUIMessage,
  MessagesData,
  PartialConversation,
} from "@/types/chat";

function prependConversationToFirstPage(
  old: ConversationsInfiniteData,
  conversation: PartialConversation
): ConversationsInfiniteData {
  return {
    ...old,
    pages: [
      {
        items: [conversation, ...(old.pages[0]?.items || [])],
        nextCursor: old.pages[0]?.nextCursor,
      },
      ...old.pages.slice(1),
    ],
  };
}

function updateInfiniteConversationCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  trpc: ReturnType<typeof useTRPC>,
  updater: (old: ConversationsInfiniteData) => ConversationsInfiniteData,
  options?: { skipFilteredSearch?: boolean }
) {
  const queries = queryClient.getQueriesData(
    trpc.infiniteConversations.infiniteQueryFilter()
  );

  queries.forEach(([queryKey]) => {
    if (options?.skipFilteredSearch) {
      const keyPart = Array.isArray(queryKey) ? queryKey[1] : undefined;
      const input = (keyPart as { input?: { search?: string } } | undefined)?.input;
      if (input?.search) {
        return;
      }
    }

    queryClient.setQueryData(queryKey, (old: ConversationsInfiniteData | undefined) => {
      if (!old) return old;
      return updater(old);
    });
  });
}

function invalidateConversationCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  trpc: ReturnType<typeof useTRPC>,
  conversationId: string
) {
  queryClient.invalidateQueries(trpc.conversation.queryFilter({ id: conversationId }));
  queryClient.invalidateQueries(trpc.messages.queryFilter({ id: conversationId }));
  queryClient.invalidateQueries(trpc.infiniteConversations.infiniteQueryFilter());
}

async function cancelConversationQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  trpc: ReturnType<typeof useTRPC>,
  conversationId: string
) {
  await queryClient.cancelQueries(trpc.conversation.queryFilter({ id: conversationId }));
  await queryClient.cancelQueries(trpc.messages.queryFilter({ id: conversationId }));
}

function setConversationMessagesCache(
  queryClient: ReturnType<typeof useQueryClient>,
  trpc: ReturnType<typeof useTRPC>,
  conversationId: string,
  messages: CustomUIMessage[]
) {
  queryClient.setQueryData(trpc.messages.queryKey({ id: conversationId }), {
    messages,
    hasMore: false,
  });
}

function updateConversationMessageCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  trpc: ReturnType<typeof useTRPC>,
  conversationId: string,
  updater: (old: MessagesData) => MessagesData
) {
  const queries = queryClient.getQueriesData(
    trpc.messages.queryFilter({ id: conversationId })
  );

  queries.forEach(([queryKey]) => {
    queryClient.setQueryData(queryKey, (old: MessagesData | undefined) => {
      if (!old) return old;
      return updater(old);
    });
  });
}

export function useConversations(
  conversations: ConversationPage,
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

export function useMessages(
  id: string,
  overrides?: { refetchOnMount?: boolean; page?: number; limit?: number }
) {
  const temporaryChat = useModelStore((state) => state.temporaryChat);
  const trpc = useTRPC();

  const options: inferReactQueryProcedureOptions<AppRouter>["messages"] = {
    enabled: !temporaryChat,
    refetchOnWindowFocus: true,
    refetchOnMount: overrides?.refetchOnMount,
    meta: {
      persist: !temporaryChat,
    },
  };

  const myQuery = trpc.messages.queryOptions(
    { id, page: overrides?.page, limit: overrides?.limit },
    options
  );

  return useQuery(myQuery);
}

export function useUpdateConversationModel() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: ({
      conversationId,
      model,
    }: {
      conversationId: string;
      model: string;
    }) => {
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
          (old: ConversationData): ConversationData => {
            if (!old) return old;
            return {
              ...old,
              model: updatedConversation.model,
            };
          }
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
      updateInfiniteConversationCaches(queryClient, trpc, (old) => ({
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: page.items.filter(
            (conv: PartialConversation) => conv.id !== conversationId
          ),
        })),
      }));
    },
  });
}

export function useAddMessage(id: string) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const conversationId = id;

  return useMutation({
    mutationFn: async ({ message }: { message: CustomUIMessage }) => {
      updateConversationMessageCaches(queryClient, trpc, conversationId, (old) => {
        if (old.messages.some((existing) => existing.id === message.id)) {
          return old;
        }

        return {
          ...old,
          messages: [...old.messages, message],
        };
      });

      updateInfiniteConversationCaches(queryClient, trpc, (old) => ({
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: page.items.map((conv: PartialConversation) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, message],
                }
              : conv
          ),
        })),
      }));

      return message;
    },
    onError: (_) => {
      invalidateConversationCaches(queryClient, trpc, conversationId);
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
      updateConversationMessageCaches(queryClient, trpc, conversationId, (old) => {
        const filteredMessages = filterMessagesUpToAnchor(
          old.messages,
          messageId,
          newContent
        );
        return {
          messages: filteredMessages,
          hasMore: old.hasMore,
        };
      });
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
        setConversationMessagesCache(
          queryClient,
          trpc,
          newConversation.id,
          newConversation.messages
        );

        updateInfiniteConversationCaches(
          queryClient,
          trpc,
          (old) => prependConversationToFirstPage(old, newConversation),
          { skipFilteredSearch: true }
        );
      }
    },
    onError: (error, newConversation) => {
      console.error("Error creating conversation:", error);
      invalidateConversationCaches(queryClient, trpc, newConversation.id);
    },
  });
}
export function useCreateConversationOptimistic() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: async (conversation: PartialConversation) => {
      await cancelConversationQueries(queryClient, trpc, conversation.id);

      queryClient.setQueryData(
        trpc.conversation.queryKey({ id: conversation.id }),
        conversation
      );
      setConversationMessagesCache(
        queryClient,
        trpc,
        conversation.id,
        conversation.messages
      );

      updateInfiniteConversationCaches(queryClient, trpc, (old) =>
        prependConversationToFirstPage(old, conversation)
      );
    },
  });
}

export function useShareConversation() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: ({
      conversationId,
      messageId,
      duration,
    }: {
      conversationId: string;
      messageId: string;
      duration: string;
    }) => shareConversationUntilMessage(conversationId, messageId, duration),
    onSuccess: () => {
      // Invalidate shares queries to refresh the share indicators
      queryClient.invalidateQueries(trpc.shares.queryFilter());
    },
  });
}

export function useShares(conversationId: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.shares.queryOptions(
      { conversationId },
      {
        enabled: Boolean(conversationId),
      }
    )
  );
}

export function useDeleteShare() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: (shareId: string) => deleteShareAction(shareId),
    onSuccess: () => {
      // Invalidate all shares queries
      queryClient.invalidateQueries(trpc.shares.queryFilter());
    },
  });
}

export function useBranchConversation() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: ({
      conversationId,
      messageId,
    }: {
      conversationId: string;
      messageId: string;
    }) => branchConversationAction(conversationId, messageId),
    onSuccess: (result, { conversationId }) => {
      // Get the original conversation to copy its data
      const originalConversation = queryClient.getQueryData(
        trpc.conversation.queryKey({ id: conversationId })
      ) as ConversationData | undefined;

      const originalMessages = queryClient.getQueryData(
        trpc.messages.queryKey({ id: conversationId })
      ) as MessagesData | undefined;

      if (originalConversation && originalMessages) {
        // Create optimistic conversation data
        const branchedConversation: PartialConversation = {
          id: result.newConversationId,
          title: `${originalConversation.title} (branched)`,
          model: originalConversation.model,
          messages: originalMessages.messages,
          lastMessageAt: new Date(),
        };

        // Set conversation cache
        queryClient.setQueryData(
          trpc.conversation.queryKey({ id: result.newConversationId }),
          branchedConversation
        );

        // Set messages cache
        setConversationMessagesCache(
          queryClient,
          trpc,
          result.newConversationId,
          originalMessages.messages
        );

        // Add to conversations list
        updateInfiniteConversationCaches(
          queryClient,
          trpc,
          (old) => prependConversationToFirstPage(old, branchedConversation),
          { skipFilteredSearch: true }
        );
      }
    },
    onError: (error) => {
      console.error("Error branching conversation:", error);
      // No need to invalidate - the new conversation doesn't exist yet
    },
  });
}
