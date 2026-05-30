"use client";

import { CheckIcon, LockIcon } from "lucide-react";
import { use, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorCost,
  ModelSelectorEmpty,
  ModelSelectorFeatures,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import { Button } from "@/components/ui/button";
import { updateDefaultModel } from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";
import { isModelGated } from "@/lib/model-gating";
import type { PublicProvider } from "@/types/provider";

export default function DefaultModelSelect({
  defaultModel,
  providers,
  maxModelCost = null,
}: Readonly<{
  defaultModel?: string;
  providers: PublicProvider[];
  maxModelCost?: number | null;
}>) {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(defaultModel);
  const [open, setOpen] = useState(false);

  const maxCost = useMemo(
    () => Math.max(1, ...providers.flatMap((p) => p.models).map((m) => m.cost)),
    [providers]
  );

  const selected = useMemo(() => {
    for (const provider of providers) {
      const match = provider.models.find((m) => m.id === selectedModel);
      if (match) return { provider, model: match };
    }
    return undefined;
  }, [providers, selectedModel]);

  useEffect(() => {
    if (selectedModel && selectedModel !== defaultModel) {
      updateDefaultModel(selectedModel).then(() => {
        toast.success(translations.settings.memory.defaultModel.sonner.title, {
          description: translations.settings.memory.defaultModel.sonner.description,
        });
      });
    }
  }, [
    selectedModel,
    defaultModel,
    translations.settings.memory.defaultModel.sonner.description,
    translations.settings.memory.defaultModel.sonner.title,
  ]);

  function handleSelect(modelId: string, gated: boolean) {
    if (gated) {
      toast.info("This model isn't available on your plan.", {
        description: "Upgrade to unlock premium models.",
      });
      return;
    }
    setSelectedModel(modelId);
    setOpen(false);
  }

  return (
    <ModelSelector open={open} onOpenChange={setOpen}>
      <ModelSelectorTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2 font-normal">
          {selected ? (
            <>
              <ModelSelectorLogo provider={selected.provider.id} />
              <ModelSelectorName>{selected.model.name}</ModelSelectorName>
            </>
          ) : (
            <span className="text-muted-foreground">
              {translations.settings.memory.defaultModel.placeholder}
            </span>
          )}
        </Button>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="Search models..." />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          {providers.map((provider) => (
            <ModelSelectorGroup heading={provider.name} key={provider.id}>
              {provider.models.map((model) => {
                const gated = isModelGated(model.cost, maxModelCost);
                return (
                  <ModelSelectorItem
                    key={model.id}
                    onSelect={() => handleSelect(model.id, gated)}
                    value={model.id}
                    className={gated ? "opacity-50" : undefined}
                  >
                    <ModelSelectorLogo provider={provider.id} />
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="min-w-0 truncate text-left text-sm">
                        {model.name}
                      </span>
                      <ModelSelectorCost cost={model.cost} maxCost={maxCost} />
                    </div>
                    <ModelSelectorFeatures features={model.features} />
                    {gated ? (
                      <LockIcon className="ml-auto size-4 text-muted-foreground" />
                    ) : selectedModel === model.id ? (
                      <CheckIcon className="ml-auto size-4" />
                    ) : (
                      <div className="ml-auto size-4" />
                    )}
                  </ModelSelectorItem>
                );
              })}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
