import { create } from "zustand";

interface SearchStore {
  searchQuery?: string;
  setSearchQuery: (searchQuery: string) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  searchQuery: undefined,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
