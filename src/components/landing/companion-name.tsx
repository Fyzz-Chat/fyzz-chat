"use client";

import { useLandingNameStore } from "@/stores/landing-name-store";
import { AnimatedName } from "./animated-name";

// Pick the fallback per slot so the sentence stays grammatical:
//   <CompanionName />                 → "Friday" | "your companion"
//   <CompanionName fallback="It" />   → "Friday" | "It" (sentence start)
export function CompanionName({
  fallback = "your companion",
}: Readonly<{ fallback?: string }>) {
  const settledName = useLandingNameStore((s) => s.settledName);
  return <AnimatedName text={settledName || fallback} />;
}
