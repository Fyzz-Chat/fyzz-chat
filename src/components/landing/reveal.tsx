"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type RevealStatus = "idle" | "pending" | "revealed";

// SSR-safe scroll reveal: "idle" renders visible (no-JS friendly), hydration
// offscreen flips to "pending" (hidden), intersection flips to "revealed".
export function useRevealStatus<T extends HTMLElement>(threshold = 0.4) {
  const ref = useRef<T>(null);
  const [status, setStatus] = useState<RevealStatus>("idle");

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
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, status };
}

export function Reveal({
  className,
  delayMs,
  children,
}: Readonly<{ className?: string; delayMs?: number; children: ReactNode }>) {
  const { ref, status } = useRevealStatus<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(
        status === "pending" && "opacity-0",
        status === "revealed" && "animate-landing-rise motion-reduce:animate-none",
        className
      )}
      style={
        status === "revealed" && delayMs ? { animationDelay: `${delayMs}ms` } : undefined
      }
    >
      {children}
    </div>
  );
}
