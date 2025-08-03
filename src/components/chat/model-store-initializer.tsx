"use client";

import { useTRPC } from "@/lib/trpc/client";
import { useModelStore } from "@/stores/model-store";
import type { PublicProvider } from "@/types/provider";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function ModelStoreInitializer() {
  const trpc = useTRPC();
  const { data: providers } = useQuery(trpc.providers.queryOptions());
  const setTemporaryChat = useModelStore((state) => state.setTemporaryChat);
  const setAvailableModels = useModelStore((state) => state.setAvailableModels);
  const setProviders = useModelStore((state) => state.setProviders);

  useEffect(() => {
    if (providers) {
      setAvailableModels(providers.flatMap((provider) => provider.models));
      setProviders(providers);
    }
    setTemporaryChat(false);
  }, [providers]);

  return null;
}
