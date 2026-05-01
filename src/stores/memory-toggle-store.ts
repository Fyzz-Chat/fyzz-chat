import { create } from "zustand";

interface MemoryToggleStore {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const useMemoryToggleStore = create<MemoryToggleStore>((set) => ({
  enabled: true,
  setEnabled: (enabled) => set({ enabled }),
}));
