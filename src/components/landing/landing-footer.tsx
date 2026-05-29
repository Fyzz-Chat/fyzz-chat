import { LandingWrap } from "./landing-wrap";

export function LandingFooter() {
  return (
    <footer className="relative z-[2] border-landing-line border-t">
      <LandingWrap className="flex h-[70px] flex-wrap items-center justify-between gap-2 text-[12px] text-landing-ink-faint">
        <span className="font-landing-display font-semibold text-[17px] text-landing-ink">
          fyzz<span className="text-landing-accent">.</span>
        </span>
        <span>One conversation · every model · nothing lost</span>
        <a
          href="https://github.com/Fyzz-chat/fyzz-chat"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-landing-accent"
        >
          © 2026 — open source
        </a>
      </LandingWrap>
    </footer>
  );
}
