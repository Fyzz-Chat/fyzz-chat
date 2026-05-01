import { create } from "zustand";
import type { PublicModel, PublicProvider } from "@/types/provider";

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
  userDefaultModelId: string | undefined;
  setUserDefaultModelId: (modelId: string | undefined) => void;
}

function getModelById(models: PublicModel[], modelId: string): PublicModel {
  return models.find((m) => m.id === modelId) || models[0];
}

function findGeminiId(models: PublicModel[]): string | undefined {
  return models.find((m) => m.id.includes("gemini-2.5-flash-lite"))?.id;
}

export const useModelStore = create<ModelStore>()((set, get) => ({
  model: {} as PublicModel,
  temporaryChat: false,
  userDefaultModelId: undefined,
  setUserDefaultModelId: (modelId) => set({ userDefaultModelId: modelId }),
  setModel: (modelId: string) =>
    set((state) => ({
      model: getModelById(state.availableModels, modelId),
    })),
  setTemporaryChat: (temporaryChat: boolean) => set({ temporaryChat }),
  availableModels: [],
  providers: [],
  setProviders: (providers: PublicProvider[]) => {
    const availableModels = providers.flatMap((provider) => provider.models);
    const geminiFlashLiteId = findGeminiId(availableModels);
    const currentId = get().model?.id;
    const preserveCurrent = currentId && availableModels.some((m) => m.id === currentId);
    set({
      providers,
      availableModels,
      model: preserveCurrent
        ? getModelById(availableModels, currentId)
        : getModelById(availableModels, geminiFlashLiteId || availableModels[0]?.id),
    });
  },
  getModel: (modelId?: string) =>
    getModelById(get().availableModels, modelId || get().model?.id),
  setDefaultModel: (modelId?: string) => {
    const { availableModels } = get();
    if (availableModels.length === 0) return;
    const geminiFlashLiteId = findGeminiId(availableModels);
    const next = getModelById(
      availableModels,
      modelId || geminiFlashLiteId || availableModels[0]?.id
    );
    if (!next) return;
    set({ model: next });
  },
}));
