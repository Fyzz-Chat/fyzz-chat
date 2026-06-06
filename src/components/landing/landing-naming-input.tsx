"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AGENT_NAME_STORAGE_KEY } from "@/lib/onboarding";
import { useLandingNameStore } from "@/stores/landing-name-store";
import { AnimatedName, SmoothWidth } from "./animated-name";

const SETTLE_MS = 1000;

export function LandingNamingInput() {
  const typedName = useLandingNameStore((s) => s.typedName);
  const settledName = useLandingNameStore((s) => s.settledName);
  const setTypedName = useLandingNameStore((s) => s.setTypedName);
  const setSettledName = useLandingNameStore((s) => s.setSettledName);

  useEffect(() => {
    const timer = setTimeout(() => setSettledName(typedName.trim()), SETTLE_MS);
    return () => clearTimeout(timer);
  }, [typedName, setSettledName]);

  const persistName = () => {
    const trimmed = typedName.trim();
    if (trimmed) {
      localStorage.setItem(AGENT_NAME_STORAGE_KEY, trimmed);
    }
  };

  return (
    <div>
      <label
        htmlFor="hero-agent-name"
        className="block text-[10.5px] text-muted-foreground uppercase tracking-[0.22em]"
      >
        What will you call yours?
      </label>
      <div className="mt-2 flex max-w-[20rem] items-baseline gap-2 border-border border-b pb-1.5 transition-colors focus-within:border-onboarding-accent">
        <input
          id="hero-agent-name"
          type="text"
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
          maxLength={60}
          placeholder="Friday"
          autoComplete="off"
          className="w-full bg-transparent font-landing-display text-[1.35rem] text-foreground italic outline-none [font-optical-sizing:auto] placeholder:text-muted-foreground/50"
        />
        <span className="shrink-0 whitespace-nowrap text-[11px] text-onboarding-accent">
          <AnimatedName text={settledName ? `✓ call me ${settledName}` : ""} />
        </span>
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href="/register"
          onClick={persistName}
          className="group inline-flex items-center gap-[9px] rounded-full bg-landing-accent px-6 py-[14px] font-semibold text-[15px] text-white shadow-[0_8px_24px_-10px_rgba(229,66,28,0.7)] transition hover:-translate-y-[2px] hover:bg-landing-accent-deep hover:shadow-[0_14px_30px_-12px_rgba(229,66,28,0.8)]"
        >
          <SmoothWidth>
            Awaken <AnimatedName text={settledName || "yours"} />
          </SmoothWidth>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
        <Link
          href="#how"
          className="inline-flex items-center rounded-full border border-border px-6 py-[14px] font-semibold text-[15px] text-foreground transition hover:bg-foreground hover:text-background"
        >
          See what it remembers
        </Link>
      </div>
    </div>
  );
}
