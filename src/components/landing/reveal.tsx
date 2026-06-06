"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type RevealStatus = "idle" | "pending" | "revealed";

export function Reveal({
  className,
  children,
}: Readonly<{ className?: string; children: ReactNode }>) {
  const ref = useRef<HTMLDivElement>(null);
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
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        status === "pending" && "opacity-0",
        status === "revealed" && "animate-landing-rise motion-reduce:animate-none",
        className
      )}
    >
      {children}
    </div>
  );
}
