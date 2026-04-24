"use client";

import { use, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { PersonaForm } from "@/components/settings/persona-form";
import {
  type GroupedMemories,
  TypedMemoryBrowser,
} from "@/components/settings/typed-memory-browser";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { updateDefaultModel, updateUserMemoryEnabled } from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";
import { useDeleteUserMemory, useUserMemories } from "@/lib/queries/memories";
import type { PublicProvider } from "@/types/provider";

export default function MemoryForm({
  defaultModel,
  initialMemories,
  initialDisplayName,
  initialAgentName,
  memoryEnabled,
  providers,
}: Readonly<{
  defaultModel?: string;
  initialMemories: GroupedMemories;
  initialDisplayName: string | null;
  initialAgentName: string | null;
  memoryEnabled: boolean;
  providers: PublicProvider[];
}>) {
  const [, startTransition] = useTransition();
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const [enabled, setEnabled] = useState(memoryEnabled);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(defaultModel);
  const isFirstRender = useRef(true);

  const { data: memories = initialMemories } = useUserMemories(initialMemories);
  const deleteMutation = useDeleteUserMemory();

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

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    startTransition(async () => {
      const nextEnabled = await updateUserMemoryEnabled(enabled);
      const title = nextEnabled
        ? translations.settings.memory.sonner.enabled.title
        : translations.settings.memory.sonner.disabled.title;
      const description = nextEnabled
        ? translations.settings.memory.sonner.enabled.description
        : translations.settings.memory.sonner.disabled.description;
      toast(title, { description });
    });
  }, [
    enabled,
    translations.settings.memory.sonner.disabled.description,
    translations.settings.memory.sonner.disabled.title,
    translations.settings.memory.sonner.enabled.description,
    translations.settings.memory.sonner.enabled.title,
  ]);

  return (
    <div className="flex flex-col items-start gap-4">
      <h4 className="font-medium text-sm">
        {translations.settings.memory.defaultModel.title}
      </h4>
      <p className="text-muted-foreground text-sm">
        {translations.settings.memory.defaultModel.description}
      </p>
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

      <h4 className="font-medium text-sm">{translations.settings.memory.sectionTitle}</h4>
      <div className="flex items-center gap-2">
        <Switch id="memory" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="memory">{translations.settings.memory.toggle.title}</Label>
      </div>
      <p className="text-muted-foreground text-sm">
        {translations.settings.memory.toggle.description}
      </p>

      <PersonaForm
        initialDisplayName={initialDisplayName}
        initialAgentName={initialAgentName}
        disabled={!enabled}
      />

      <div className="w-full">
        <TypedMemoryBrowser
          memories={memories}
          onDelete={(id) => deleteMutation.mutateAsync(id)}
          isDeleting={deleteMutation.isPending}
          disabled={!enabled}
        />
      </div>
    </div>
  );
}
