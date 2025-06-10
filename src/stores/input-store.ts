import { debounce } from "@/lib/utils";
import { create } from "zustand";

function persistInput(input: string) {
  localStorage.setItem("fyzz-input-content", input);
}

const debouncePersistInput = debounce(persistInput, 1000);

interface InputStore {
  input: string;
  setInput: (input: string) => void;
}

export const useInputStore = create<InputStore>((set) => ({
  input: "",
  setInput: (input) => {
    set({ input });
    debouncePersistInput(input);
  },
}));
