"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AGENT_NAME_STORAGE_KEY } from "@/lib/onboarding";

const SETTLE_MS = 1000;
const ENTER_STAGGER_MS = 35;
const EXIT_STAGGER_MS = 25;
const EXIT_DURATION_MS = 250;

function AnimatedName({ text }: Readonly<{ text: string }>) {
  const [shown, setShown] = useState(text);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (text === shown) return;
    if (!shown) {
      setShown(text);
      return;
    }
    setExiting(true);
    const exitTotal = (shown.length - 1) * EXIT_STAGGER_MS + EXIT_DURATION_MS;
    const timer = setTimeout(() => {
      setExiting(false);
      setShown(text);
    }, exitTotal);
    return () => clearTimeout(timer);
  }, [text, shown]);

  if (!shown) return null;

  return (
    <span key={shown}>
      <span className="sr-only">{text || shown}</span>
      <span aria-hidden="true">
        {[...shown].map((char, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: chars are positional; the outer key resets the list per text
            key={i}
            className={`inline-block motion-reduce:animate-none ${
              exiting
                ? "fade-out slide-out-to-bottom-1 animate-out fill-mode-forwards duration-200"
                : "fade-in slide-in-from-bottom-1 animate-in fill-mode-backwards duration-300"
            }`}
            style={{
              animationDelay: exiting
                ? `${(shown.length - 1 - i) * EXIT_STAGGER_MS}ms`
                : `${i * ENTER_STAGGER_MS}ms`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
    </span>
  );
}

function SmoothWidth({ children }: Readonly<{ children: React.ReactNode }>) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number>();

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setWidth(el.scrollWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      className="inline-flex overflow-hidden transition-[width] duration-300 ease-out motion-reduce:transition-none"
      style={{ width: width === undefined ? "auto" : `${width}px` }}
    >
      <span ref={measureRef} className="whitespace-nowrap">
        {children}
      </span>
    </span>
  );
}

export function LandingNamingInput() {
  const [name, setName] = useState("");
  const [settledName, setSettledName] = useState("");
  const trimmed = name.trim().slice(0, 60);

  useEffect(() => {
    const timer = setTimeout(() => setSettledName(trimmed), SETTLE_MS);
    return () => clearTimeout(timer);
  }, [trimmed]);

  const persistName = () => {
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
          value={name}
          onChange={(e) => setName(e.target.value)}
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
