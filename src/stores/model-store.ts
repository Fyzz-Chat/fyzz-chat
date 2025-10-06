import type { PublicModel, PublicProvider } from "@/types/provider";
import { create } from "zustand";

interface ModelStore {
  model: PublicModel;
  setModel: (model: string) => void;
  temporaryChat: boolean;
  setTemporaryChat: (temporaryChat: boolean) => void;
  availableModels: PublicModel[];
  providers: PublicProvider[];
  setProviders: (providers: PublicProvider[]) => void;
  getModel: (modelId?: string) => PublicModel;
  setDefaultModel: (modelId?: string) => void;
}

function getModelById(models: PublicModel[], modelId: string): PublicModel {
  return models.find((m) => m.id === modelId) || models[0];
}

export const useModelStore = create<ModelStore>()((set, get) => ({
  model: {} as PublicModel,
  temporaryChat: false,
  setModel: (modelId: string) =>
    set((state) => ({
      model: getModelById(state.availableModels, modelId),
    })),
  setTemporaryChat: (temporaryChat: boolean) => set({ temporaryChat }),
  availableModels: [],
  providers: [],
  setProviders: (providers: PublicProvider[]) => {
    const availableModels = providers.flatMap((provider) => provider.models);
    set({
      providers,
      availableModels,
      model: availableModels[0],
    });
  },
  getModel: (modelId?: string) =>
    getModelById(get().availableModels, modelId || get().model?.id),
  setDefaultModel: (modelId?: string) => {
    const { availableModels } = get();
    set({ model: getModelById(availableModels, modelId || availableModels[0]?.id) });
  },
}));
