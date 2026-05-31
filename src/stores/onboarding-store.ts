import { create } from "zustand";

interface OnboardingStore {
  // Drives the onboarding overlay's visibility. The overlay auto-opens on first
  // run (set from server state on mount); the profile-menu "Finish setup" entry
  // reopens it from anywhere in the app via this shared store.
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
