"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import useToast from "@/hooks/use-toast";
import {
  updateDefaultModel,
  updateUserMemory,
  updateUserMemoryEnabled,
} from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";
import { initialState } from "@/lib/utils";
import type { PublicProvider } from "@/types/provider";
import { use, useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const [state, formAction, isPending] = useActionState(updateUserMemory, initialState);
  const [content, setContent] = useState(memory ?? "");
  const [enabled, setEnabled] = useState(memoryEnabled);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(defaultModel);
  const isFirstRender = useRef(true);

  useToast(state);

  useEffect(() => {
    if (selectedModel && selectedModel !== defaultModel) {
      updateDefaultModel(selectedModel);
      toast.success(translations.settings.memory.defaultModel.sonner.title, {
        description: translations.settings.memory.defaultModel.sonner.description,
      });
    }
  }, [selectedModel]);

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
  }, [enabled]);

  return (
    <div className="flex flex-col gap-4 items-start">
      <h4 className="text-sm font-medium">
        {translations.settings.memory.defaultModel.title}
      </h4>
      <p className="text-sm text-muted-foreground">
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
      <h4 className="text-sm font-medium">{translations.settings.memory.sectionTitle}</h4>
      <div className="flex items-center gap-2">
        <Switch id="memory" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="memory">{translations.settings.memory.toggle.title}</Label>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {translations.settings.memory.toggle.description}
        </p>
        <p className="text-sm text-muted-foreground">
          {enabled
            ? translations.settings.memory.toggle.descriptionEnabled
            : translations.settings.memory.toggle.descriptionDisabled}
        </p>
      </div>
      <form action={formAction} className="flex flex-col gap-4 w-full items-start">
        <Textarea
          name="memory"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!enabled}
          rows={6}
          className="resize-none"
        />
        <Button type="submit" className="px-5 self-end" disabled={!enabled || isPending}>
          {translations.settings.memory.saveButton}
        </Button>
      </form>
    </div>
  );
}
