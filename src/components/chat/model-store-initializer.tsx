"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { useModelStore } from "@/stores/model-store";
import type { PublicProvider } from "@/types/provider";

export default function ModelStoreInitializer({
  providers,
  defaultModel,
}: Readonly<{
  providers?: PublicProvider[];
  defaultModel?: string | null;
}>) {
  const trpc = useTRPC();
  const { data } = useQuery(
    trpc.providers.queryOptions(undefined, {
      initialData: providers,
      refetchOnMount: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    })
  );
  const setTemporaryChat = useModelStore((state) => state.setTemporaryChat);
  const setProviders = useModelStore((state) => state.setProviders);
  const setDefaultModel = useModelStore((state) => state.setDefaultModel);
  const setUserDefaultModelId = useModelStore((state) => state.setUserDefaultModelId);

  useEffect(() => {
    if (data) {
      setProviders(data);
      setDefaultModel(defaultModel ?? undefined);
    }
    setTemporaryChat(false);
    setUserDefaultModelId(defaultModel ?? undefined);
  }, [
    data,
    setProviders,
    setTemporaryChat,
    setDefaultModel,
    setUserDefaultModelId,
    defaultModel,
  ]);

  return null;
}
