"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { useModelStore } from "@/stores/model-store";
import type { PublicProvider } from "@/types/provider";

export default function ModelStoreInitializer({
  providers,
}: Readonly<{
  providers?: PublicProvider[];
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

  useEffect(() => {
    if (data) {
      setProviders(data);
    }
    setTemporaryChat(false);
  }, [data, setProviders, setTemporaryChat]);

  return null;
}
