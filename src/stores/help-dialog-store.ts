import { create } from "zustand";

interface HelpDialogStore {
  helpOpen: boolean;
  setHelpOpen: (helpOpen: boolean | ((helpOpen: boolean) => boolean)) => void;
}

export const useHelpDialogStore = create<HelpDialogStore>((set, get) => ({
  helpOpen: false,
  setHelpOpen: (helpOpen) =>
    set({
      helpOpen: typeof helpOpen === "function" ? helpOpen(get().helpOpen) : helpOpen,
    }),
}));
