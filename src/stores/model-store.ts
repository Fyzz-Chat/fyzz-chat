import type { PublicModel, PublicProvider } from "@/types/provider";
import { create } from "zustand";

interface ModelStore {
  model: PublicModel;
  setModel: (model: string) => void;
  temporaryChat: boolean;
  setTemporaryChat: (temporaryChat: boolean) => void;
  availableModels: PublicModel[];
  setAvailableModels: (availableModels: PublicModel[]) => void;
  providers: PublicProvider[];
  setProviders: (providers: PublicProvider[]) => void;
}

function getModelById(models: PublicModel[], modelId: string): PublicModel {
  return models.find((m) => m.id === modelId) || models[0];
}

export const useModelStore = create<ModelStore>((set) => ({
  model: {} as PublicModel,
  setModel: (modelId: string) =>
    set((state) => ({
      model: getModelById(state.availableModels, modelId),
    })),
  temporaryChat: false,
  setTemporaryChat: (temporaryChat: boolean) => set({ temporaryChat }),
  availableModels: [],
  setAvailableModels: (availableModels: PublicModel[]) =>
    set(() => ({
      availableModels,
      model: availableModels[0],
    })),
  providers: [],
  setProviders: (providers: PublicProvider[]) => set({ providers }),
}));
