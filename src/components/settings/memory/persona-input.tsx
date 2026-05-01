"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { updateUserPersona } from "@/lib/actions/users";
import { useMemoryToggleStore } from "@/stores/memory-toggle-store";

type Field = "displayName" | "agentName";

const FIELD_META: Record<Field, { id: string; placeholder: string; toast: string }> = {
  displayName: {
    id: "display-name",
    placeholder: "How you want to be called",
    toast: "Your name saved",
  },
  agentName: {
    id: "agent-name",
    placeholder: "What to call your assistant",
    toast: "Agent name saved",
  },
};

export default function PersonaInput({
  field,
  initialValue,
}: Readonly<{
  field: Field;
  initialValue: string | null;
}>) {
  const enabled = useMemoryToggleStore((s) => s.enabled);
  const [value, setValue] = useState(initialValue ?? "");
  const [savedValue, setSavedValue] = useState(initialValue ?? "");
  const meta = FIELD_META[field];

  async function save() {
    try {
      await updateUserPersona({ [field]: value });
      setSavedValue(value);
      toast.success(meta.toast);
    } catch {
      toast.error("Failed to save");
    }
  }

  return (
    <Input
      id={meta.id}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (value.trim() !== savedValue.trim()) {
          save();
        }
      }}
      placeholder={meta.placeholder}
      maxLength={60}
      disabled={!enabled}
    />
  );
}
