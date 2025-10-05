"use client";

import { useTRPC } from "@/lib/trpc/client";
import { useModelStore } from "@/stores/model-store";
import type { PublicProvider } from "@/types/provider";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function ModelStoreInitializer({
  providers,
}: {
  providers?: PublicProvider[];
}) {
  const trpc = useTRPC();
  const { data } = useQuery(
    trpc.providers.queryOptions(undefined, {
      initialData: providers,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    })
  );
  const setTemporaryChat = useModelStore((state) => state.setTemporaryChat);
  const setProviders = useModelStore((state) => state.setProviders);

  useEffect(() => {
    if (data) {
      setProviders(data);
    }
    setTemporaryChat(false);
  }, [data]);

  return null;
}
