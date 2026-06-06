import { create } from "zustand";

interface LandingNameStore {
  typedName: string;
  settledName: string;
  setTypedName: (name: string) => void;
  setSettledName: (name: string) => void;
}

export const useLandingNameStore = create<LandingNameStore>((set) => ({
  typedName: "",
  settledName: "",
  setTypedName: (name) => set({ typedName: name }),
  setSettledName: (name) => set({ settledName: name }),
}));
