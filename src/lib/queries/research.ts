"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTRPC } from "@/lib/trpc/client";

const POLL_INTERVAL_MS = 20_000;

export function useResearchPolling({
  messageId,
  conversationId,
  enabled,
}: {
  messageId: string;
  conversationId: string;
  enabled: boolean;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const query = useQuery({
    ...trpc.research.poll.queryOptions({ messageId }),
    enabled,
    refetchInterval: enabled ? POLL_INTERVAL_MS : false,
    refetchOnWindowFocus: enabled,
    staleTime: 0,
    meta: { persist: false },
  });

  const status = query.data?.status;

  useEffect(() => {
    if (status === "complete" || status === "failed") {
      void queryClient.invalidateQueries(
        trpc.messages.queryFilter({ id: conversationId })
      );
    }
  }, [status, conversationId, queryClient, trpc]);

  return query;
}
