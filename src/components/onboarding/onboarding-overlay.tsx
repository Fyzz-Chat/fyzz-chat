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

const WELCOME = "Let's awaken something that understands you.";

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
    title: "What should I call you?",
    description: "Your true name. The one that feels like home.",
    placeholder: "Joe",
    maxLength: 60,
    multiline: false,
    autoComplete: "name",
  },
  {
    key: "agentName",
    title: "What will you call me?",
    description: "Fyzz. Friday. Echo. Something only you would choose.",
    placeholder: "Fyzz",
    maxLength: 60,
    multiline: false,
  },
  {
    key: "role",
    title: "Who are you when no one's watching?",
    description: "Your craft, obsessions, the work that matters.",
    placeholder: "Founder building the future of human-AI collaboration…",
    maxLength: 240,
    multiline: true,
  },
  {
    key: "preferences",
    title: "How do you want to be answered?",
    description: "Set the tone of our conversations forever.",
    placeholder: "Be direct. Show code first. Cut the ceremony.",
    maxLength: 600,
    multiline: true,
  },
  {
    key: "context",
    title: "What should I never forget?",
    description: "Your world. Your constraints. Your taste.",
    placeholder: "Primarily TypeScript + Next.js. Allergic to bloated abstractions…",
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
    draft?.values ?? { ...emptyValues, displayName: initialName || "Joe" }
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const didAutoOpen = useRef(false);

  useEffect(() => {
    if (autoOpen && !didAutoOpen.current) {
      didAutoOpen.current = true;
      open();
    }
  }, [autoOpen, open]);

  if (!enabled) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const displayName = values.displayName || "Joe";
  const agentName = values.agentName || "Fyzz";

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
    if (current.multiline && event.shiftKey) return;
    event.preventDefault();
    advance();
  };

  const value = values[current.key] ?? "";

  return (
    <AlertDialog open={isOpen}>
      {/* 
        Responsive layout overrides default shadcn max-width.
        - Mobile: Fits screen with margins, scrolls automatically.
        - Desktop (md+): Fixed size with beautiful dual-column setup.
      */}
      <AlertDialogContent className="flex h-[90vh] w-[calc(100vw-2rem)] max-w-none flex-col overflow-hidden p-0 md:h-[580px] md:max-w-[920px] md:flex-row">
        {/* Memory Spine Sidebar (Desktop Only) */}
        <div className="hidden w-72 shrink-0 flex-col justify-between border-border border-r bg-muted/40 p-8 md:flex">
          <div>
            <div className="mb-10 flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-onboarding-accent font-bold text-[10px] text-onboarding-accent-foreground">
                {agentName.charAt(0).toUpperCase()}
              </div>
              <span className="font-serif text-xl tracking-tighter">{agentName}</span>
            </div>

            <div className="space-y-7">
              {STEPS.map((s, i) => {
                const isActive = i === step;
                const isComplete = i < step;
                return (
                  <div
                    key={s.key}
                    className={`flex gap-3 transition-all duration-300 ${
                      isActive ? "opacity-100" : isComplete ? "opacity-75" : "opacity-35"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border font-medium text-xs transition-all ${
                        isComplete
                          ? "border-onboarding-accent bg-onboarding-accent text-onboarding-accent-foreground"
                          : isActive
                            ? "border-onboarding-accent bg-card text-onboarding-accent ring-1 ring-onboarding-accent/40"
                            : "border-border text-muted-foreground"
                      }`}
                    >
                      {isComplete ? "✓" : i + 1}
                    </div>
                    <div className="pt-0.5">
                      <p className="font-medium text-foreground text-xs leading-tight">
                        {s.title}
                      </p>
                      <p className="mt-0.5 text-[9px] text-muted-foreground">
                        CHAPTER {i + 1}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-border border-t pt-6 text-[11px] text-muted-foreground leading-normal">
            These parameters will shape how your companion sees you.
          </div>
        </div>

        {/* Main Workspace (Scrollable/Flexible) */}
        <div className="flex h-full flex-1 flex-col overflow-hidden">
          {/* Mobile Top Progress Header */}
          <div className="flex items-center justify-between border-border border-b bg-muted/20 p-4 md:hidden">
            <span className="font-serif text-base tracking-tighter">{agentName}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-[10px] text-muted-foreground uppercase">
                Step {step + 1} of {STEPS.length}
              </span>
              <div className="flex gap-1" aria-hidden="true">
                {STEPS.map((s, i) => (
                  <span
                    key={s.key}
                    className={`h-1 w-3 rounded-full ${
                      i <= step ? "bg-onboarding-accent" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Workspace Area */}
          <div className="flex flex-1 flex-col justify-between overflow-y-auto p-6 md:p-10">
            <div>
              {step === 0 && (
                <p className="mb-4 font-serif text-onboarding-accent text-sm italic tracking-tight md:text-base">
                  {WELCOME}
                </p>
              )}

              <div>
                <div className="mb-1 font-medium text-[9px] text-onboarding-accent uppercase tracking-[1.5px]">
                  CHAPTER {step + 1} — THE AWAKENING
                </div>
                <AlertDialogTitle className="font-semibold text-2xl text-foreground leading-tight tracking-tighter md:text-3xl">
                  {current.title}
                </AlertDialogTitle>
              </div>

              <AlertDialogDescription className="mt-2 max-w-md text-muted-foreground text-xs md:mt-3 md:text-sm">
                {current.description}
              </AlertDialogDescription>

              {/* Personalization Echo */}
              {(step === 0 || step === 1) && (
                <div className="mt-4 inline-flex flex-wrap items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-[11px] md:mt-5">
                  <span className="font-medium text-onboarding-accent">✓</span>
                  <span className="text-muted-foreground">
                    I will address you as{" "}
                    <span className="font-medium text-foreground">{displayName}</span>
                  </span>
                  <span className="mx-0.5 text-muted-foreground/50">•</span>
                  <span className="text-muted-foreground">
                    Call me{" "}
                    <span className="font-medium text-foreground">{agentName}</span>
                  </span>
                </div>
              )}

              {/* Dynamic Input Frame */}
              <div className="mt-6 md:mt-8">
                {current.multiline ? (
                  <Textarea
                    ref={focusField}
                    key={current.key}
                    value={value}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={current.maxLength}
                    placeholder={current.placeholder}
                    className="min-h-[120px] w-full resize-none rounded-lg px-4 py-3 text-sm md:min-h-[160px] md:text-base"
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
                    className="h-12 rounded-lg px-4 text-sm md:h-14 md:text-base"
                  />
                )}
                {error && <p className="mt-2 text-destructive text-xs">{error}</p>}
              </div>
            </div>

            {/* Bottom Navigation Panel */}
            <div className="mt-8 flex items-center justify-between border-border border-t pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={skip}
                disabled={pending}
                className="text-muted-foreground text-xs md:text-sm"
              >
                Finish Later
              </Button>

              <div className="flex items-center gap-2 md:gap-3">
                {step !== 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={back}
                    disabled={pending}
                    className="h-9 text-xs md:h-10 md:text-sm"
                  >
                    ← Back
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={advance}
                  disabled={pending}
                  className="h-9 min-w-[110px] text-xs transition-all active:scale-[0.985] md:h-10 md:min-w-[130px] md:text-sm"
                >
                  {isLast ? (pending ? "Binding…" : `Awaken ${agentName}`) : "Next"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
