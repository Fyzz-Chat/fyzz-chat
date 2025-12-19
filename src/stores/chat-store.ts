import { create } from "zustand";
import type { CustomUIMessage } from "@/types/chat";

type ChatStatus = "submitted" | "streaming" | "ready" | "error";

interface ChatStore {
  // State
  lastMessage: CustomUIMessage | null;
  status: ChatStatus;
  error?: Error;
  input: string;
  stableId: string;
  browse: boolean;

  // Actions - These will be connected by the ChatProvider component
  setChatInput: (input: string) => string;
  editMessage: (messageId: string, content: string) => void;
  stop: () => void;
  regenerate: (messageId: string) => void;
  emptySubmit: () => void;
  setBrowse: (browse: boolean) => void;
  setStableId: (id: string) => void;
}

// Create the store with initial empty/stub values
export const useChatStore = create<ChatStore>((set) => ({
  lastMessage: null,
  status: "ready",
  error: undefined,
  input: "",
  stableId: "",
  browse: false,

  // Stub actions that will be replaced by the provider
  setChatInput: () => {
    console.warn("ChatProvider not yet connected");
    return "";
  },
  editMessage: () => console.warn("ChatProvider not yet connected"),
  stop: () => console.warn("ChatProvider not yet connected"),
  regenerate: () => console.warn("ChatProvider not yet connected"),
  emptySubmit: () => console.warn("ChatProvider not yet connected"),

  // State setters that can be used anywhere
  setBrowse: (browse) => set({ browse }),
  setStableId: (stableId) => set({ stableId }),
}));
