"use client";

import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateDefaultModel } from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";
import type { PublicProvider } from "@/types/provider";

export default function DefaultModelSelect({
  defaultModel,
  providers,
}: Readonly<{
  defaultModel?: string;
  providers: PublicProvider[];
}>) {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(defaultModel);

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

  return (
    <Select value={selectedModel} onValueChange={setSelectedModel}>
      <SelectTrigger>
        <SelectValue
          placeholder={translations.settings.memory.defaultModel.placeholder}
        />
      </SelectTrigger>
      <SelectContent>
        {providers.map((provider, index) => (
          <SelectGroup key={`${provider.id}-${index}`}>
            <SelectLabel>{provider.name}</SelectLabel>
            {provider.models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
