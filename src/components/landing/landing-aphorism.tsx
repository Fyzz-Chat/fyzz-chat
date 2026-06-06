import { LandingWrap } from "./landing-wrap";
import { Reveal } from "./reveal";

export function LandingAphorism() {
  return (
    <section className="relative py-[clamp(4.5rem,13vh,8.5rem)]">
      {/* Fading hairlines — bright at center, dissolving toward the edges. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute top-1/2 left-1/2 mt-[-240px] ml-[-440px] h-[480px] w-[880px] animate-onboarding-breathe rounded-full bg-[radial-gradient(ellipse,var(--onboarding-accent),transparent_70%)] blur-3xl [animation-delay:-2s] motion-reduce:animate-none" />
      </div>

      <Reveal>
        <LandingWrap>
          <div className="mx-auto grid w-fit grid-cols-1 items-start gap-[6px] min-[620px]:grid-cols-[auto_1fr] min-[620px]:gap-[clamp(1.25rem,4vw,3.5rem)]">
            <div
              aria-hidden="true"
              className="font-landing-display font-semibold text-[3rem] text-onboarding-accent leading-[0.7] min-[620px]:text-[clamp(4rem,9vw,8rem)]"
            >
              &ldquo;
            </div>
            <blockquote className="max-w-[22ch] font-[360] font-landing-display text-[clamp(1.7rem,4.4vw,3.5rem)] text-foreground/90 italic leading-[1.18] tracking-[-0.018em]">
              An assistant you re-brief every morning isn&apos;t a partner —{" "}
              <em className="text-onboarding-accent italic">
                it&apos;s a stranger who happens to type fast.
              </em>
            </blockquote>
          </div>
        </LandingWrap>
      </Reveal>
    </section>
  );
}
