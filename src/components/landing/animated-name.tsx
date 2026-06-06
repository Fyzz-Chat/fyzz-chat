"use client";

import { useEffect, useRef, useState } from "react";

const ENTER_STAGGER_MS = 35;
const EXIT_STAGGER_MS = 25;
const EXIT_DURATION_MS = 250;

export function AnimatedName({ text }: Readonly<{ text: string }>) {
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

export function SmoothWidth({ children }: Readonly<{ children: React.ReactNode }>) {
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
