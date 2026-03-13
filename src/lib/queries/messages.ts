import type { QueryClient } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import { filterMessagesUpToAnchor } from "@/lib/utils";
import type { MessagesData } from "@/types/chat";

function optimisticallyTrimMessagesUpToAnchor(
  queryClient: QueryClient,
  trpc: ReturnType<typeof useTRPC>,
  conversationId: string,
  messageId: string,
  newContent?: string
) {
  const previousQueries = queryClient.getQueriesData<MessagesData>(
    trpc.messages.queryFilter({ id: conversationId })
  );

  previousQueries.forEach(([queryKey]) => {
    queryClient.setQueryData(queryKey, (old: MessagesData | undefined) => {
      if (!old) return old;
      return {
        ...old,
        messages: filterMessagesUpToAnchor(old.messages, messageId, newContent),
      };
    });
  });

  return () => {
    previousQueries.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data);
    });
  };
}

export function useOptimisticallyTrimMessagesUpToAnchor(conversationId: string) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return (messageId: string, newContent?: string) =>
    optimisticallyTrimMessagesUpToAnchor(
      queryClient,
      trpc,
      conversationId,
      messageId,
      newContent
    );
}
