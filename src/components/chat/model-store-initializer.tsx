"use client";

import { useModelStore } from "@/stores/model-store";
import type { PublicProvider } from "@/types/provider";
import { useEffect } from "react";

export default function ModelStoreInitializer({
  providers,
}: {
  providers: PublicProvider[];
}) {
  const setTemporaryChat = useModelStore((state) => state.setTemporaryChat);
  const setAvailableModels = useModelStore((state) => state.setAvailableModels);
  const setProviders = useModelStore((state) => state.setProviders);

  useEffect(() => {
    setAvailableModels(providers.flatMap((provider) => provider.models));
    setProviders(providers);
    setTemporaryChat(false);
  }, []);

  return null;
}
