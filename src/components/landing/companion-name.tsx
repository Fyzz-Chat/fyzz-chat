"use client";

import { useLandingNameStore } from "@/stores/landing-name-store";
import { AnimatedName, SmoothWidth } from "./animated-name";

// Pick the fallback per slot so the sentence stays grammatical:
//   <CompanionName />                 → "Friday" | "your companion"
//   <CompanionName fallback="It" />   → "Friday" | "It" (sentence start)
//
// SmoothWidth keeps the surrounding prose from snapping: the name's width
// animates, so following words slide instead of jumping on reflow.
export function CompanionName({
  fallback = "your companion",
}: Readonly<{ fallback?: string }>) {
  const settledName = useLandingNameStore((s) => s.settledName);
  return (
    <SmoothWidth>
      <AnimatedName text={settledName || fallback} />
    </SmoothWidth>
  );
}
