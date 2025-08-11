import type { UIMessage } from "ai";
import { create } from "zustand";

type ChatStatus = "submitted" | "streaming" | "ready" | "error";

interface ChatStore {
  // State
  lastMessage: UIMessage | null;
  status: ChatStatus;
  error?: Error;
  input: string;
  stableId: string;
  browse: boolean;

  // Actions - These will be connected by the ChatProvider component
  setChatInput: (input: string) => string;
  deleteMessagesAfter: (messageId: string, newContent?: string) => void;
  stop: () => void;
  reload: () => void;
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
  deleteMessagesAfter: () => console.warn("ChatProvider not yet connected"),
  stop: () => console.warn("ChatProvider not yet connected"),
  reload: () => console.warn("ChatProvider not yet connected"),
  emptySubmit: () => console.warn("ChatProvider not yet connected"),

  // State setters that can be used anywhere
  setBrowse: (browse) => set({ browse }),
  setStableId: (stableId) => set({ stableId }),
}));
