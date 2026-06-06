import Link from "next/link";
import { LandingWrap } from "./landing-wrap";

export function LandingMasthead() {
  return (
    <header className="absolute inset-x-0 top-0 z-[3]">
      <LandingWrap className="flex h-16 items-center justify-between">
        <div className="font-landing-display font-semibold text-[25px] text-foreground tracking-[-0.02em]">
          fyzz<span className="text-onboarding-accent">.</span>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="font-medium text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-foreground px-4 py-[7px] font-semibold text-[13px] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Awaken yours
          </Link>
        </div>
      </LandingWrap>
    </header>
  );
}
