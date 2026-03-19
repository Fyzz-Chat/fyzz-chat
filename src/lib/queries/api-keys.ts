import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createApiKeyAction, deleteApiKeyAction } from "@/lib/actions/api-keys";
import { useTRPC } from "@/lib/trpc/client";

type ApiKeyItem = {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: Date | null;
  createdAt: Date;
};

type ApiKeysData = ApiKeyItem[] | undefined;

export function useApiKeys(initialData?: ApiKeyItem[]) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.apiKeys.queryOptions(),
    initialData,
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: (name: string) => createApiKeyAction(name),
    onSuccess: (result, name) => {
      queryClient.setQueryData(trpc.apiKeys.queryKey(), (old: ApiKeysData) => {
        const newKey: ApiKeyItem = {
          id: result.id,
          name,
          prefix: result.prefix,
          lastUsedAt: null,
          createdAt: result.createdAt,
        };
        return old ? [newKey, ...old] : [newKey];
      });
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation({
    mutationFn: (id: string) => deleteApiKeyAction(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries(trpc.apiKeys.queryFilter());
      const previous = queryClient.getQueryData(trpc.apiKeys.queryKey());

      queryClient.setQueryData(trpc.apiKeys.queryKey(), (old: ApiKeysData) => {
        return old?.filter((k) => k.id !== id);
      });

      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(trpc.apiKeys.queryKey(), context.previous);
      }
    },
  });
}
