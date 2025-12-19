import { create } from "zustand";

interface UIStore {
  helpOpen: boolean;
  setHelpOpen: (helpOpen: boolean | ((helpOpen: boolean) => boolean)) => void;
  modelMenuOpen: boolean;
  setModelMenuOpen: (
    modelMenuOpen: boolean | ((modelMenuOpen: boolean) => boolean)
  ) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  helpOpen: false,
  setHelpOpen: (helpOpen) =>
    set({
      helpOpen: typeof helpOpen === "function" ? helpOpen(get().helpOpen) : helpOpen,
    }),
  modelMenuOpen: false,
  setModelMenuOpen: (modelMenuOpen) =>
    set({
      modelMenuOpen:
        typeof modelMenuOpen === "function"
          ? modelMenuOpen(get().modelMenuOpen)
          : modelMenuOpen,
    }),
}));
