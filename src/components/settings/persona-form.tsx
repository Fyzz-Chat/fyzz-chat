"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserPersona } from "@/lib/actions/users";

type PersonaFormProps = {
  initialDisplayName: string | null;
  initialAgentName: string | null;
  disabled?: boolean;
};

export function PersonaForm({
  initialDisplayName,
  initialAgentName,
  disabled = false,
}: PersonaFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [agentName, setAgentName] = useState(initialAgentName ?? "");
  const [savedDisplayName, setSavedDisplayName] = useState(initialDisplayName ?? "");
  const [savedAgentName, setSavedAgentName] = useState(initialAgentName ?? "");

  async function saveField(field: "displayName" | "agentName", value: string) {
    try {
      await updateUserPersona({ [field]: value });
      if (field === "displayName") setSavedDisplayName(value);
      else setSavedAgentName(value);
      toast.success(field === "displayName" ? "Your name saved" : "Agent name saved");
    } catch {
      toast.error("Failed to save");
    }
  }

  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="display-name">Your name</Label>
        <Input
          id="display-name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          onBlur={() => {
            if (displayName.trim() !== savedDisplayName.trim()) {
              saveField("displayName", displayName);
            }
          }}
          placeholder="How you want to be called"
          maxLength={60}
          disabled={disabled}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="agent-name">Agent name</Label>
        <Input
          id="agent-name"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          onBlur={() => {
            if (agentName.trim() !== savedAgentName.trim()) {
              saveField("agentName", agentName);
            }
          }}
          placeholder="What to call your assistant"
          maxLength={60}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
