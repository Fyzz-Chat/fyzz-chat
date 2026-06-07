import { CompanionName } from "./companion-name";
import { LandingMemoryLedger } from "./landing-memory-ledger";
import { LandingWrap } from "./landing-wrap";
import { Reveal } from "./reveal";

// Block 3 — "The Memory". The dawn: the brightest light on the page
// (memory = accumulated light). Absorbs the old Before/After section's job
// and carries its #how anchor.
export function LandingMemory() {
  return (
    <section id="how" className="relative scroll-mt-20 py-[clamp(5rem,14vh,9rem)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute top-1/2 left-1/2 mt-[-280px] ml-[-550px] h-[560px] w-[1100px] animate-onboarding-breathe rounded-full bg-[radial-gradient(ellipse,var(--onboarding-accent),transparent_70%)] blur-3xl motion-reduce:animate-none" />
      </div>
      {/* Warm-white core over the ledger — dawn, not midnight. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-[58%] mt-[-160px] ml-[-260px] h-[320px] w-[520px] animate-onboarding-breathe rounded-full bg-[radial-gradient(ellipse,color-mix(in_srgb,var(--onboarding-accent)_45%,white),transparent_70%)] blur-3xl [animation-delay:-1.6s] motion-reduce:animate-none" />
      </div>

      <LandingWrap className="relative grid grid-cols-1 items-center gap-[clamp(2.5rem,6vw,5rem)] min-[900px]:grid-cols-[1fr_minmax(360px,440px)]">
        <Reveal>
          <span className="inline-flex items-center gap-[9px] text-[10.5px] text-onboarding-accent uppercase tracking-[0.24em]">
            <span className="size-[7px] animate-landing-pulse rounded-full bg-onboarding-accent motion-reduce:animate-none" />
            Memory
          </span>
          <h2 className="mt-5 max-w-[18ch] font-[560] font-landing-display text-[clamp(2.2rem,5.5vw,4rem)] text-foreground leading-[1.02] tracking-[-0.03em] [font-optical-sizing:auto]">
            The last time you start from zero
            <span className="text-onboarding-accent">.</span>
          </h2>
          <p className="mt-6 max-w-[46ch] text-[clamp(1.02rem,1.6vw,1.18rem)] text-muted-foreground leading-[1.6]">
            Tell <CompanionName fallback="it" /> who your clients are, how you write, what
            you’re building. From then on, every conversation begins already knowing.
          </p>
          <p className="mt-4 font-landing-display text-[clamp(1.02rem,1.6vw,1.18rem)] text-foreground/90 italic">
            No re-briefing. No pasted context.{" "}
            <em className="text-onboarding-accent italic">No stranger.</em>
          </p>
        </Reveal>

        <LandingMemoryLedger />
      </LandingWrap>
    </section>
  );
}
