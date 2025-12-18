import { useChatStore } from "@/stores/chat-store";

export function useStableId() {
  return useChatStore((state) => state.stableId);
}
