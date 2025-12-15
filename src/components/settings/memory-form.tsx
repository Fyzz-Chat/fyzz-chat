"use client";

import { use, useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  updateDefaultModel,
  updateUserMemory,
  updateUserMemoryEnabled,
} from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";
import type { PublicProvider } from "@/types/provider";

export default function MemoryForm({
  defaultModel,
  memory,
  memoryEnabled,
  providers,
}: {
  defaultModel?: string;
  memory?: string;
  memoryEnabled: boolean;
  providers: PublicProvider[];
}) {
  const [isPending, startTransition] = useTransition();
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const { handleSubmit } = useForm<{ memory: string }>();
  const [content, setContent] = useState(memory ?? "");
  const [enabled, setEnabled] = useState(memoryEnabled);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(defaultModel);
  const isFirstRender = useRef(true);

  async function onSubmit() {
    startTransition(async () => {
      const state = await updateUserMemory(content);
      toast.success(state.message, {
        description: state.description,
      });
    });
  }

  useEffect(() => {
    if (selectedModel && selectedModel !== defaultModel) {
      updateDefaultModel(selectedModel).then(() => {
        toast.success(translations.settings.memory.defaultModel.sonner.title, {
          description: translations.settings.memory.defaultModel.sonner.description,
        });
      });
    }
  }, [selectedModel, defaultModel, translations.settings.memory.defaultModel.sonner.description, translations.settings.memory.defaultModel.sonner.title]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    updateUserMemoryEnabled(enabled).then((enabled: boolean) => {
      const title = enabled
        ? translations.settings.memory.sonner.enabled.title
        : translations.settings.memory.sonner.disabled.title;
      const description = enabled
        ? translations.settings.memory.sonner.enabled.description
        : translations.settings.memory.sonner.disabled.description;

      toast(title, {
        description,
      });
    });
  }, [enabled, translations.settings.memory.sonner.disabled.description, translations.settings.memory.sonner.disabled.title, translations.settings.memory.sonner.enabled.description, translations.settings.memory.sonner.enabled.title]);

  return (
    <div className="flex flex-col items-start gap-4">
      <h4 className="font-medium text-sm">
        {translations.settings.memory.defaultModel.title}
      </h4>
      <p className="text-muted-foreground text-sm">
        {translations.settings.memory.defaultModel.description}
      </p>
      <div>
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
      </div>
      <h4 className="font-medium text-sm">{translations.settings.memory.sectionTitle}</h4>
      <div className="flex items-center gap-2">
        <Switch id="memory" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="memory">{translations.settings.memory.toggle.title}</Label>
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          {translations.settings.memory.toggle.description}
        </p>
        <p className="text-muted-foreground text-sm">
          {enabled
            ? translations.settings.memory.toggle.descriptionEnabled
            : translations.settings.memory.toggle.descriptionDisabled}
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col items-start gap-4"
      >
        <Textarea
          name="memory"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!enabled}
          rows={6}
          className="resize-none"
        />
        <Button type="submit" className="self-end px-5" disabled={!enabled || isPending}>
          {translations.settings.memory.saveButton}
        </Button>
      </form>
    </div>
  );
}
