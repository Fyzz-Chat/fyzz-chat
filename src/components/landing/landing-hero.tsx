import Link from "next/link";
import { LandingWrap } from "./landing-wrap";

export function LandingHero() {
  return (
    <section className="pt-[clamp(3.5rem,11vh,8.125rem)] pb-[clamp(2.5rem,7vh,5.75rem)]">
      <LandingWrap>
        <span className="inline-flex animate-landing-rise items-center gap-[9px] rounded-full border border-landing-line bg-landing-paper py-[7px] pr-[15px] pl-[13px] text-[11px] text-landing-ink-dim uppercase tracking-[0.2em] motion-reduce:animate-none">
          <span className="size-[7px] animate-landing-pulse rounded-full bg-landing-accent motion-reduce:animate-none" />
          for consultants who live in AI all day
        </span>

        <h1 className="mt-[30px] max-w-[14ch] animate-landing-rise font-[580] font-landing-display text-[clamp(3.6rem,13.5vw,12rem)] leading-[0.9] tracking-[-0.035em] [animation-delay:80ms] [font-optical-sizing:auto] motion-reduce:animate-none">
          Stop <span className="font-[480] italic">starting</span>{" "}
          <span className="relative whitespace-nowrap">
            over<span className="text-landing-accent">.</span>
            <span className="absolute right-[-1%] bottom-[0.07em] left-[-1%] h-[0.085em] origin-left animate-landing-swipe rounded-[2px] bg-landing-accent [transform:scaleX(0)] motion-reduce:animate-none motion-reduce:[transform:scaleX(1)]" />
          </span>
        </h1>

        <div className="mt-[clamp(2.125rem,5vw,3.625rem)] grid grid-cols-1 items-end gap-[30px] min-[880px]:grid-cols-[1.6fr_1fr] min-[880px]:gap-[clamp(1.75rem,5vw,4.5rem)]">
          <div className="animate-landing-rise [animation-delay:220ms] motion-reduce:animate-none">
            <p className="max-w-[34ch] text-[clamp(1.12rem,2.1vw,1.5rem)] text-landing-ink-dim leading-[1.45]">
              Fyzz remembers your clients and your style, so you never re-brief the AI
              again.{" "}
              <b className="font-semibold text-landing-ink">
                One conversation, every model, nothing lost.
              </b>
            </p>
            <div className="mt-[30px] flex flex-wrap gap-3">
              <Link
                href="/register"
                className="group inline-flex items-center gap-[9px] rounded-full bg-landing-accent px-6 py-[14px] font-semibold text-[15px] text-white shadow-[0_8px_24px_-10px_rgba(229,66,28,0.7)] transition hover:-translate-y-[2px] hover:bg-landing-accent-deep hover:shadow-[0_14px_30px_-12px_rgba(229,66,28,0.8)]"
              >
                Try it free — bring real work
                <svg
                  width="15"
                  height="15"
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
              <Link
                href="#how"
                className="inline-flex items-center rounded-full border border-landing-ink px-6 py-[14px] font-semibold text-[15px] text-landing-ink transition hover:bg-landing-ink hover:text-landing-paper"
              >
                See how it works
              </Link>
            </div>
          </div>

          <div className="animate-landing-rise border-landing-accent border-l-2 pl-[18px] font-landing-display text-[1.15rem] text-landing-ink-dim italic leading-[1.45] [animation-delay:360ms] motion-reduce:animate-none">
            <span className="mb-[9px] block font-landing-sans text-[10px] text-landing-ink-faint uppercase not-italic tracking-[0.22em]">
              [ why it's different ]
            </span>
            It knows your clients, picks up where you left off, and never goes down when a
            provider does.
          </div>
        </div>
      </LandingWrap>
    </section>
  );
}
