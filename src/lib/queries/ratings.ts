import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rateMessage, unrateMessage } from "@/lib/actions/ratings";
import { useTRPC } from "@/lib/trpc/client";

type RatingItem = {
  id: string;
  value: number;
  messageId: string;
  conversationId: string;
  userId: string;
  createdAt: Date;
};

type RatingsData = RatingItem[] | undefined;

export function useRatingsForConversation(conversationId: string) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.ratingsForConversation.queryOptions({ conversationId }),
    enabled: Boolean(conversationId),
  });
}

export function useRateMessage(conversationId: string) {
  const qc = useQueryClient();
  const trpc = useTRPC();
  const queryKey = trpc.ratingsForConversation.queryKey({ conversationId });

  return useMutation({
    mutationFn: ({ messageId, value }: { messageId: string; value: number }) =>
      rateMessage(messageId, value),
    onMutate: async ({ messageId, value }) => {
      await qc.cancelQueries(trpc.ratingsForConversation.queryFilter({ conversationId }));
      const previous = qc.getQueryData(queryKey);
      qc.setQueryData(queryKey, (old: RatingsData) => {
        const existing = old?.find((r) => r.messageId === messageId);
        if (existing) {
          return old?.map((r) => (r.messageId === messageId ? { ...r, value } : r));
        }
        return [
          ...(old ?? []),
          {
            id: `optimistic-${messageId}`,
            messageId,
            conversationId,
            userId: "",
            value,
            createdAt: new Date(),
          },
        ];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      qc.invalidateQueries(trpc.ratingsForConversation.queryFilter({ conversationId }));
    },
  });
}

export function useUnrateMessage(conversationId: string) {
  const qc = useQueryClient();
  const trpc = useTRPC();
  const queryKey = trpc.ratingsForConversation.queryKey({ conversationId });

  return useMutation({
    mutationFn: (messageId: string) => unrateMessage(messageId),
    onMutate: async (messageId) => {
      await qc.cancelQueries(trpc.ratingsForConversation.queryFilter({ conversationId }));
      const previous = qc.getQueryData(queryKey);
      qc.setQueryData(queryKey, (old: RatingsData) =>
        old?.filter((r) => r.messageId !== messageId)
      );
      return { previous };
    },
    onError: (_err, _messageId, context) => {
      if (context?.previous) qc.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      qc.invalidateQueries(trpc.ratingsForConversation.queryFilter({ conversationId }));
    },
  });
}
