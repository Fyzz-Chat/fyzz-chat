import { create } from "zustand";

interface HelpDialogStore {
  helpOpen: boolean;
  setHelpOpen: (helpOpen: boolean) => void;
}

export const useHelpDialogStore = create<HelpDialogStore>((set) => ({
  helpOpen: false,
  setHelpOpen: (helpOpen) => set({ helpOpen }),
}));
