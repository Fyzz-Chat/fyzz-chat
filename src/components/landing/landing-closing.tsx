import { CompanionName } from "./companion-name";
import { LandingClosingCta } from "./landing-closing-cta";
import { LandingWrap } from "./landing-wrap";
import { Reveal } from "./reveal";

export function LandingClosing() {
  return (
    <section className="relative py-[clamp(4.5rem,12vh,8.5rem)] text-center">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute top-[58%] left-1/2 mt-[-150px] ml-[-300px] h-[300px] w-[600px] animate-onboarding-breathe rounded-full bg-[radial-gradient(ellipse,var(--onboarding-accent),transparent_70%)] blur-3xl [animation-delay:-2.4s] motion-reduce:animate-none" />
      </div>

      <LandingWrap className="relative">
        <Reveal>
          <h2 className="font-[560] font-landing-display text-[clamp(2.4rem,7vw,5.5rem)] text-foreground leading-[0.95] tracking-[-0.03em] [font-optical-sizing:auto]">
            Stop starting over<span className="text-onboarding-accent">.</span>
          </h2>
          <p className="mx-auto mt-5 mb-[34px] max-w-[40ch] text-balance text-[1.1rem] text-muted-foreground">
            Tell <CompanionName fallback="it" /> once, and never again. Free to begin — no
            card.
          </p>
          <LandingClosingCta />
        </Reveal>
      </LandingWrap>
    </section>
  );
}
