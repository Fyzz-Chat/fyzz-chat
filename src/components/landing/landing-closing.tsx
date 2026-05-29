import Link from "next/link";
import { LandingWrap } from "./landing-wrap";

export function LandingClosing() {
  return (
    <section className="border-landing-ink border-t py-[clamp(3.5rem,11vh,8.125rem)] text-center">
      <LandingWrap className="animate-landing-rise motion-reduce:animate-none">
        <h2 className="font-[560] font-landing-display text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.03em]">
          Stop starting over<span className="text-landing-accent">.</span>
        </h2>
        <p className="mx-auto mt-5 mb-[34px] max-w-[40ch] text-[1.1rem] text-landing-ink-dim">
          Bring real client work and watch it remember. Free to try — no card.
        </p>
        <Link
          href="/register"
          className="group inline-flex items-center gap-[9px] rounded-full bg-landing-accent px-[30px] py-4 font-semibold text-[16px] text-white shadow-[0_8px_24px_-10px_rgba(229,66,28,0.7)] transition hover:-translate-y-[2px] hover:bg-landing-accent-deep hover:shadow-[0_14px_30px_-12px_rgba(229,66,28,0.8)]"
        >
          Try Fyzz free
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </LandingWrap>
    </section>
  );
}
