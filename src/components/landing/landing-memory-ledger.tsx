"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CompanionName } from "./companion-name";

// The memory ledger — rows write themselves in one by one on scroll, so the
// card fills with remembered things as you watch. Same SSR-safe reveal pattern
// as reveal.tsx, plus per-row stagger.
const ENTRIES = [
  { tag: "person", text: "Sarah — toughest client, allergic to jargon" },
  { tag: "style", text: "Decisions up top, bullets after" },
  { tag: "project", text: "Q3 pitch — deadline June 26" },
] as const;

const ROW_STAGGER_MS = 160;

type LedgerStatus = "idle" | "pending" | "revealed";

export function LandingMemoryLedger() {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<LedgerStatus>("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStatus("revealed");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatus("revealed");
          observer.disconnect();
        } else {
          setStatus((prev) => (prev === "revealed" ? prev : "pending"));
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const riseAt = (delayMs: number) => ({
    className: cn(
      status === "pending" && "opacity-0",
      status === "revealed" && "animate-landing-rise motion-reduce:animate-none"
    ),
    style: status === "revealed" ? { animationDelay: `${delayMs}ms` } : undefined,
  });

  const frame = riseAt(0);

  return (
    <div ref={ref}>
      <div
        className={cn(
          "rounded-xl border border-foreground/10 bg-foreground/[0.04] p-[clamp(1.375rem,2.4vw,2rem)] shadow-[0_24px_70px_-32px_rgba(0,0,0,0.85)] backdrop-blur-sm",
          frame.className
        )}
        style={frame.style}
      >
        <div className="text-[10.5px] text-muted-foreground uppercase tracking-[0.22em]">
          What <CompanionName fallback="it" /> carries
        </div>
        <ul className="mt-3">
          {ENTRIES.map((entry, i) => {
            const row = riseAt(200 + i * ROW_STAGGER_MS);
            return (
              <li
                key={entry.tag}
                className={cn(
                  "flex items-baseline gap-4 border-foreground/[0.07] border-b py-3.5",
                  row.className
                )}
                style={row.style}
              >
                <span className="w-16 shrink-0 text-[10px] text-onboarding-accent uppercase tracking-[0.18em]">
                  {entry.tag}
                </span>
                <span className="text-[14.5px] text-foreground/85 leading-[1.5]">
                  {entry.text}
                </span>
              </li>
            );
          })}
          {(() => {
            const row = riseAt(200 + ENTRIES.length * ROW_STAGGER_MS);
            return (
              <li
                className={cn("flex items-baseline gap-4 py-3.5", row.className)}
                style={row.style}
              >
                <span className="w-16 shrink-0 text-[10px] text-onboarding-accent uppercase tracking-[0.18em]">
                  identity
                </span>
                <span className="text-[14.5px] text-foreground/85 leading-[1.5]">
                  Answers to <CompanionName fallback="the name you give it" />
                </span>
              </li>
            );
          })()}
        </ul>
      </div>
      {(() => {
        const line = riseAt(200 + (ENTRIES.length + 1) * ROW_STAGGER_MS);
        return (
          <p
            className={cn(
              "mt-5 font-landing-display text-[14px] text-muted-foreground italic leading-[1.5]",
              line.className
            )}
            style={line.style}
          >
            Memory compounds — the more you tell <CompanionName fallback="it" /> once, the
            less you explain forever.
          </p>
        );
      })()}
    </div>
  );
}
