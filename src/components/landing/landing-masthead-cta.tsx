"use client";

import Link from "next/link";
import { AGENT_NAME_STORAGE_KEY } from "@/lib/onboarding";
import { useLandingNameStore } from "@/stores/landing-name-store";
import { AnimatedName, SmoothWidth } from "./animated-name";

export function LandingMastheadCta() {
  const typedName = useLandingNameStore((s) => s.typedName);
  const settledName = useLandingNameStore((s) => s.settledName);

  const persistName = () => {
    const trimmed = typedName.trim();
    if (trimmed) {
      localStorage.setItem(AGENT_NAME_STORAGE_KEY, trimmed);
    }
  };

  return (
    <Link
      href="/register"
      onClick={persistName}
      className="rounded-full border border-border px-4 py-[7px] font-semibold text-[13px] text-foreground transition duration-150 ease-out hover:border-foreground/60 hover:bg-foreground/[0.06] hover:duration-200 active:scale-[0.985] active:duration-75 motion-reduce:active:scale-100"
    >
      <SmoothWidth>
        Awaken <AnimatedName text={settledName || "yours"} />
      </SmoothWidth>
    </Link>
  );
}
