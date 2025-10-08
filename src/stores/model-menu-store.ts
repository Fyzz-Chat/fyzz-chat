import { create } from "zustand";

interface ModelMenuStore {
  modelMenuOpen: boolean;
  setModelMenuOpen: (
    modelMenuOpen: boolean | ((modelMenuOpen: boolean) => boolean)
  ) => void;
}

export const useModelMenuStore = create<ModelMenuStore>((set, get) => ({
  modelMenuOpen: false,
  setModelMenuOpen: (modelMenuOpen) =>
    set({
      modelMenuOpen:
        typeof modelMenuOpen === "function"
          ? modelMenuOpen(get().modelMenuOpen)
          : modelMenuOpen,
    }),
}));
