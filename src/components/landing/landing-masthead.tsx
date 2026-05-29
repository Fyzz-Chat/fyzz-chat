import Link from "next/link";
import { LandingWrap } from "./landing-wrap";

export function LandingMasthead() {
  return (
    <header className="relative z-[2] border-landing-line border-b bg-[color-mix(in_srgb,var(--color-landing-paper)_80%,transparent)] backdrop-blur-[6px]">
      <LandingWrap className="flex h-16 items-center justify-between">
        <div className="font-landing-display font-semibold text-[25px] tracking-[-0.02em]">
          fyzz<span className="text-landing-accent">.</span>
        </div>
        <div className="hidden text-[10.5px] text-landing-ink-faint uppercase tracking-[0.24em] sm:block">
          An AI workspace · built for consultants
        </div>
        <Link
          href="/register"
          className="rounded-full border border-landing-ink px-4 py-[7px] font-semibold text-[13px] transition-colors hover:bg-landing-ink hover:text-landing-paper"
        >
          Try it free
        </Link>
      </LandingWrap>
    </header>
  );
}
