"use client";

import {
  type GroupedMemories,
  TypedMemoryBrowser,
} from "@/components/settings/typed-memory-browser";
import { useDeleteUserMemory, useUserMemories } from "@/lib/queries/memories";
import { useMemoryToggleStore } from "@/stores/memory-toggle-store";

export default function MemoryListSection({
  initialMemories,
}: Readonly<{ initialMemories: GroupedMemories }>) {
  const enabled = useMemoryToggleStore((s) => s.enabled);
  const { data: memories = initialMemories } = useUserMemories(initialMemories);
  const deleteMutation = useDeleteUserMemory();
  return (
    <TypedMemoryBrowser
      memories={memories}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      isDeleting={deleteMutation.isPending}
      disabled={!enabled}
    />
  );
}
