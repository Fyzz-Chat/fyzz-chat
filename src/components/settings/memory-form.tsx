"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import useToast from "@/hooks/use-toast";
import { updateUserMemory, updateUserMemoryEnabled } from "@/lib/actions/users";
import { initialState } from "@/lib/utils";
import type { Dictionary } from "@/types/locale";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function MemoryForm({
  memory,
  memoryEnabled,
  dict,
}: {
  memory?: string;
  memoryEnabled: boolean;
  dict: Dictionary["settings"]["memory"];
}) {
  const [state, formAction, isPending] = useActionState(updateUserMemory, initialState);
  const [content, setContent] = useState(memory ?? "");
  const [enabled, setEnabled] = useState(memoryEnabled);
  const isFirstRender = useRef(true);

  useToast(state);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    updateUserMemoryEnabled(enabled).then((enabled: boolean) => {
      const title = enabled ? dict.sonner.enabled.title : dict.sonner.disabled.title;
      const description = enabled
        ? dict.sonner.enabled.description
        : dict.sonner.disabled.description;

      toast(title, {
        description,
      });
    });
  }, [enabled]);

  return (
    <div className="flex flex-col gap-4 items-start">
      <h4 className="text-sm font-medium">{dict.sectionTitle}</h4>
      <div className="flex items-center gap-2">
        <Switch id="memory" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="memory">{dict.toggleTitle}</Label>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{dict.toggleDescription}</p>
        <p className="text-sm text-muted-foreground">
          {enabled ? dict.toggleDescriptionEnabled : dict.toggleDescriptionDisabled}
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
          {dict.saveButton}
        </Button>
      </form>
    </div>
  );
}
