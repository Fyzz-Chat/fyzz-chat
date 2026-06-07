import { LandingWrap } from "./landing-wrap";

export function LandingFooter() {
  return (
    <footer className="relative">
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-transparent via-foreground/15 to-transparent"
      />
      <LandingWrap className="flex flex-col items-center gap-2 py-5 text-[12px] text-muted-foreground min-[640px]:h-[70px] min-[640px]:flex-row min-[640px]:py-0">
        <span className="font-landing-display font-semibold text-[17px] text-foreground min-[640px]:flex-1">
          fyzz<span className="text-onboarding-accent">.</span>
        </span>
        <span>One conversation · every model · nothing lost</span>
        <span className="min-[640px]:flex-1 min-[640px]:text-right">
          <a
            href="https://github.com/Fyzz-chat/fyzz-chat"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-onboarding-accent"
          >
            © 2026 — open source
          </a>
        </span>
      </LandingWrap>
    </footer>
  );
}
