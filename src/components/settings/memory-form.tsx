"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import useToast from "@/hooks/use-toast";
import { updateUserMemory, updateUserMemoryEnabled } from "@/lib/actions/users";
import { initialState } from "@/lib/utils";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function MemoryForm({
  memory,
  memoryEnabled,
}: {
  memory?: string;
  memoryEnabled: boolean;
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
      const title = enabled ? "Memory enabled" : "Memory disabled";
      const description = enabled
        ? "Models will now store information about you."
        : "Models will no longer store information about you.";

      toast(title, {
        description,
      });
    });
  }, [enabled]);

  return (
    <div className="flex flex-col gap-4 items-start">
      <h4 className="text-sm font-medium">Memory</h4>
      <div className="flex items-center gap-2">
        <Switch id="memory" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="memory">Enable memory</Label>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          If memory is enabled, the model will store information about you and will use it
          to improve the quality of its responses.
        </p>
        <p className="text-sm text-muted-foreground">
          {enabled
            ? "You can edit the memory here manually. Press Save when you're done."
            : "Enable memory to edit."}
        </p>
      </div>
      <form action={formAction} className="flex flex-col gap-4 w-full items-start">
        <Textarea
          name="memory"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!enabled}
          rows={8}
          className="resize-none"
        />
        <Button type="submit" className="px-5" disabled={!enabled || isPending}>
          Save
        </Button>
      </form>
    </div>
  );
}
