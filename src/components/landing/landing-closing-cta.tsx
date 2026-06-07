"use client";

import Link from "next/link";
import { AGENT_NAME_STORAGE_KEY } from "@/lib/onboarding";
import { useLandingNameStore } from "@/stores/landing-name-store";
import { AnimatedName, SmoothWidth } from "./animated-name";

export function LandingClosingCta() {
  const settledName = useLandingNameStore((s) => s.settledName);

  const persistName = () => {
    if (settledName) {
      localStorage.setItem(AGENT_NAME_STORAGE_KEY, settledName);
    }
  };

  return (
    <Link
      href="/register"
      onClick={persistName}
      className="group inline-flex items-center gap-[9px] rounded-full bg-landing-accent px-[30px] py-4 font-semibold text-[16px] text-white shadow-[0_8px_24px_-10px_rgba(229,66,28,0.7)] transition duration-150 ease-out hover:translate-y-[-2px] hover:bg-landing-accent-deep hover:shadow-[0_14px_34px_-12px_rgba(229,66,28,0.85),0_0_24px_-6px_rgba(229,66,28,0.4)] hover:duration-250 hover:ease-[cubic-bezier(0.34,1.56,0.64,1)] active:translate-y-0 active:scale-[0.985] active:shadow-[0_4px_12px_-6px_rgba(229,66,28,0.6)] active:duration-75 motion-reduce:active:scale-100 motion-reduce:hover:translate-y-0"
    >
      <SmoothWidth>
        Awaken <AnimatedName text={settledName || "yours"} />
      </SmoothWidth>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        aria-hidden="true"
        className="transition-transform duration-150 ease-out group-hover:translate-x-1 group-hover:duration-250 group-hover:ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:group-hover:translate-x-0"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  );
}
