import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shareConversationUntilMessage } from "@/lib/actions/conversations";
import { deleteShareAction } from "@/lib/actions/shares";
import { useTRPC } from "@/lib/trpc/client";
import { addDurationToDate } from "@/lib/utils";

type SharesData = { shares: { id: string; messageId: string; expiresAt: Date | null }[] };

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
    onSuccess: (shareId, { conversationId, messageId, duration }) => {
      queryClient.setQueryData(
        trpc.shares.queryKey({ conversationId }),
        (old: SharesData | undefined) => ({
          shares: [
            ...(old?.shares ?? []),
            {
              id: shareId,
              messageId,
              expiresAt: addDurationToDate(new Date(), duration),
            },
          ],
        })
      );
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

  type DeleteShareVariables = { shareId: string; conversationId: string };

  return useMutation({
    mutationFn: ({ shareId }: DeleteShareVariables) => deleteShareAction(shareId),
    onMutate: async ({ shareId, conversationId }: DeleteShareVariables) => {
      await queryClient.cancelQueries(trpc.shares.queryFilter({ conversationId }));

      const previousShares = queryClient.getQueryData(
        trpc.shares.queryKey({ conversationId })
      );

      queryClient.setQueryData(
        trpc.shares.queryKey({ conversationId }),
        (old: SharesData | undefined) => {
          if (!old) return old;
          return {
            shares: old.shares.filter((share) => share.id !== shareId),
          };
        }
      );

      return { previousShares, conversationId };
    },
    onError: (_, __, context) => {
      if (!context) return;
      queryClient.setQueryData(
        trpc.shares.queryKey({ conversationId: context.conversationId }),
        context.previousShares
      );
    },
  });
}
