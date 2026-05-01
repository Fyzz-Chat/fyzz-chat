"use client";

import { use, useEffect, useRef, useTransition } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateUserMemoryEnabled } from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";
import { useMemoryToggleStore } from "@/stores/memory-toggle-store";

export default function MemoryToggle({
  initialEnabled,
}: Readonly<{ initialEnabled: boolean }>) {
  const enabled = useMemoryToggleStore((s) => s.enabled);
  const setEnabled = useMemoryToggleStore((s) => s.setEnabled);
  const initialized = useRef(false);
  const [, startTransition] = useTransition();
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);

  if (!initialized.current) {
    initialized.current = true;
    if (enabled !== initialEnabled) {
      setEnabled(initialEnabled);
    }
  }

  useEffect(() => {
    if (!initialized.current) return;
    if (enabled === initialEnabled) return;
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
    initialEnabled,
    translations.settings.memory.sonner.disabled.description,
    translations.settings.memory.sonner.disabled.title,
    translations.settings.memory.sonner.enabled.description,
    translations.settings.memory.sonner.enabled.title,
  ]);

  return (
    <div className="flex items-center gap-2">
      <Switch id="memory" checked={enabled} onCheckedChange={setEnabled} />
      <Label htmlFor="memory">{translations.settings.memory.toggle.title}</Label>
    </div>
  );
}
