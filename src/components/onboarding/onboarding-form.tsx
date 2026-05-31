"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { completeOnboarding, type OnboardingFormState } from "@/lib/actions/onboarding";
import type { OnboardingInput } from "@/lib/onboarding";

function readForm(formData: FormData): OnboardingInput {
  return {
    displayName: String(formData.get("displayName") ?? ""),
    agentName: String(formData.get("agentName") ?? ""),
    role: String(formData.get("role") ?? ""),
    preferences: String(formData.get("preferences") ?? ""),
    context: String(formData.get("context") ?? ""),
  };
}

export default function OnboardingForm({
  initialDisplayName,
}: Readonly<{ initialDisplayName: string }>) {
  const [state, formAction, pending] = useActionState<OnboardingFormState, FormData>(
    async (prevState, formData) => completeOnboarding(prevState, readForm(formData)),
    {}
  );

  return (
    <form action={formAction} className="grid gap-6 border bg-card p-5 shadow-sm sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="displayName">Your name</Label>
          <Input
            id="displayName"
            name="displayName"
            defaultValue={initialDisplayName}
            maxLength={60}
            autoComplete="name"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="agentName">Assistant name</Label>
          <Input id="agentName" name="agentName" placeholder="Jarvis" maxLength={60} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="role">What should Fyzz know about you?</Label>
        <Textarea
          id="role"
          name="role"
          maxLength={240}
          placeholder="Role, current work, or anything that should shape answers."
          className="min-h-24 resize-none"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="preferences">How do you like answers?</Label>
        <Textarea
          id="preferences"
          name="preferences"
          maxLength={600}
          placeholder="Tone, level of detail, defaults, or recurring preferences."
          className="min-h-28 resize-none"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="context">Any durable context?</Label>
        <Textarea
          id="context"
          name="context"
          maxLength={600}
          placeholder="Projects, constraints, background, or anything worth remembering."
          className="min-h-28 resize-none"
        />
      </div>

      {state.error && <p className="text-destructive text-sm">{state.error}</p>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-xs">
          Stored as profile fields and typed memories.
        </p>
        <Button type="submit" disabled={pending} className="sm:min-w-36">
          {pending ? "Saving" : "Start chatting"}
        </Button>
      </div>
    </form>
  );
}
