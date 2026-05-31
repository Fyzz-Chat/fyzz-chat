"use client";

import { useRouter } from "next/navigation";
import { type KeyboardEvent, useEffect, useRef, useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { completeOnboarding, skipOnboarding } from "@/lib/actions/onboarding";
import { type OnboardingInput, parseOnboardingDraft } from "@/lib/onboarding";
import { useOnboardingStore } from "@/stores/onboarding-store";

const WELCOME = "Let's make Fyzz yours. Takes about a minute.";

type StepKey = keyof OnboardingInput;

type Step = {
  key: StepKey;
  title: string;
  description: string;
  placeholder: string;
  maxLength: number;
  multiline: boolean;
  autoComplete?: string;
};

const STEPS: Step[] = [
  {
    key: "displayName",
    title: "First things first — what's your name?",
    description: "So Fyzz can talk to you, not at you.",
    placeholder: "Your name",
    maxLength: 60,
    multiline: false,
    autoComplete: "name",
  },
  {
    key: "agentName",
    title: "Give your assistant a name",
    description: "Jarvis? Friday? Something only you'd pick? Skip to keep it simple.",
    placeholder: "Jarvis",
    maxLength: 60,
    multiline: false,
  },
  {
    key: "role",
    title: "Tell Fyzz a bit about you",
    description: "Your role, what you're working on — whatever helps it get you.",
    placeholder: "I'm a founder building an OSS chat app…",
    maxLength: 240,
    multiline: true,
  },
  {
    key: "preferences",
    title: "How do you like your answers?",
    description: "Short and sharp? Deep dives? Set the tone once, keep it forever.",
    placeholder: "Be direct and concise. Show code before prose.",
    maxLength: 600,
    multiline: true,
  },
  {
    key: "context",
    title: "Anything worth remembering?",
    description: "Projects, constraints, the stuff you'd hate to repeat.",
    placeholder: "Working mostly in TypeScript and Next.js…",
    maxLength: 600,
    multiline: true,
  },
];

const emptyValues: OnboardingInput = {
  displayName: "",
  agentName: "",
  role: "",
  preferences: "",
  context: "",
};

export default function OnboardingOverlay({
  enabled,
  autoOpen,
  initialDraft,
  initialName,
}: Readonly<{
  enabled: boolean;
  autoOpen: boolean;
  initialDraft: unknown;
  initialName: string;
}>) {
  const router = useRouter();
  const isOpen = useOnboardingStore((s) => s.isOpen);
  const open = useOnboardingStore((s) => s.open);
  const close = useOnboardingStore((s) => s.close);

  const draft = parseOnboardingDraft(initialDraft);

  const [step, setStep] = useState(draft?.step ?? 0);
  const [values, setValues] = useState<OnboardingInput>(
    draft?.values ?? { ...emptyValues, displayName: initialName }
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const didAutoOpen = useRef(false);

  // First-run auto-open: fire once from server state. Resume-from-menu opens are
  // driven directly through the shared store by the profile menu.
  useEffect(() => {
    if (autoOpen && !didAutoOpen.current) {
      didAutoOpen.current = true;
      open();
    }
  }, [autoOpen, open]);

  if (!enabled) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // Fires on each field mount (fields remount per step via `key`), focusing the
  // active field and placing the cursor at the end of any prefilled value.
  const focusField = (field: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (!field) return;
    field.focus();
    const end = field.value.length;
    field.setSelectionRange(end, end);
  };

  const setCurrentValue = (value: string) => {
    setValues((prev) => ({ ...prev, [current.key]: value }));
  };

  const finish = () => {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding(values);
      if (result?.error) {
        setError(result.error);
        return;
      }
      close();
      router.refresh();
    });
  };

  // Skipping or dismissing (X / Escape / click-outside) saves the draft so the
  // user can resume from the profile menu, and records the skip so it never
  // auto-resurfaces. Self-exploration is never blocked.
  const skip = () => {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      await skipOnboarding({ values, step });
      close();
      router.refresh();
    });
  };

  const advance = () => {
    if (pending) return;
    if (isLast) {
      finish();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    if (pending) return;
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (event.key !== "Enter") return;
    // Shift+Enter inserts a newline in multiline fields.
    if (current.multiline && event.shiftKey) return;
    event.preventDefault();
    advance();
  };

  const value = values[current.key] ?? "";

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="gap-6">
        {/* {step === 0 && (
          <p className="text-center font-medium text-foreground text-sm">{WELCOME}</p>
        )} */}
        <div className="space-y-1.5">
          <p className="font-medium text-muted-foreground text-xs">
            Step {step + 1} of {STEPS.length}
          </p>
          <div className="flex gap-1.5" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span
                key={s.key}
                className={`h-1 flex-1 rounded-full ${
                  i <= step ? "bg-foreground" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <AlertDialogTitle>{current.title}</AlertDialogTitle>
          <AlertDialogDescription>{current.description}</AlertDialogDescription>
        </div>

        {current.multiline ? (
          <Textarea
            ref={focusField}
            key={current.key}
            value={value}
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={current.maxLength}
            placeholder={current.placeholder}
            className="min-h-28 resize-none"
          />
        ) : (
          <Input
            ref={focusField}
            key={current.key}
            value={value}
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={current.maxLength}
            placeholder={current.placeholder}
            autoComplete={current.autoComplete}
          />
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={skip} disabled={pending}>
            Skip
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={back}
              disabled={step === 0 || pending}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={advance}
              disabled={pending}
              className="min-w-20"
            >
              {isLast ? (pending ? "Saving..." : "All set") : "Next"}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
