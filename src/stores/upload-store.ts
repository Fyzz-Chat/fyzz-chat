import { create } from "zustand";

type UploadStatus = "uploading" | "failed";

interface UploadEntry {
  status: UploadStatus;
  // Re-runs the background upload + send for this message (used by the
  // "retry" affordance on a failed attachment preview).
  retry: () => void;
}

interface UploadStore {
  // Keyed by the optimistic user message id.
  uploads: Record<string, UploadEntry>;
  start: (messageId: string, retry: () => void) => void;
  fail: (messageId: string) => void;
  clear: (messageId: string) => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  uploads: {},
  start: (messageId, retry) =>
    set((state) => ({
      uploads: { ...state.uploads, [messageId]: { status: "uploading", retry } },
    })),
  fail: (messageId) =>
    set((state) => {
      const entry = state.uploads[messageId];
      if (!entry) {
        return state;
      }
      return {
        uploads: { ...state.uploads, [messageId]: { ...entry, status: "failed" } },
      };
    }),
  clear: (messageId) =>
    set((state) => {
      if (!state.uploads[messageId]) {
        return state;
      }
      const { [messageId]: _removed, ...rest } = state.uploads;
      return { uploads: rest };
    }),
}));
