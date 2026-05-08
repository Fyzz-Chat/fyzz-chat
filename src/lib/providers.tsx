import { ModelSelectorLogo } from "@/components/ai-elements/model-selector";
import type { PublicProvider } from "@/types/provider";

export function getProviderIcon(providers: PublicProvider[], modelId: string | null) {
  if (!modelId) return <ModelSelectorLogo provider="google" />;

  const provider = providers.find((p) => p.models.some((m) => m.id === modelId));
  return <ModelSelectorLogo provider={provider?.id || "google"} />;
}
