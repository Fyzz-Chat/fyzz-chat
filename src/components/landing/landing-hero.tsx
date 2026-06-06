import { CompanionName } from "./companion-name";
import { LandingHeroWhisper } from "./landing-hero-whisper";
import { LandingNamingInput } from "./landing-naming-input";
import { LandingWrap } from "./landing-wrap";

export function LandingHero() {
  return (
    <section className="relative flex min-h-dvh flex-col justify-center overflow-hidden pt-[clamp(5.5rem,12vh,8rem)] pb-[clamp(3.5rem,10vh,7rem)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-[4%] left-1/2 ml-[-260px] h-[520px] w-[520px] animate-onboarding-breathe rounded-full bg-[radial-gradient(circle,var(--onboarding-accent),transparent_70%)] opacity-25 blur-3xl motion-reduce:animate-none" />
        <div className="absolute top-[16%] left-[56%] h-[380px] w-[380px] animate-onboarding-breathe rounded-full bg-[radial-gradient(circle,var(--onboarding-glow),transparent_70%)] opacity-20 blur-3xl [animation-delay:-1.3s] motion-reduce:animate-none" />
      </div>

      <LandingWrap className="relative">
        <span className="inline-flex animate-landing-rise items-center gap-[9px] text-[10.5px] text-onboarding-accent uppercase tracking-[0.24em] motion-reduce:animate-none">
          <span className="size-[7px] animate-landing-pulse rounded-full bg-onboarding-accent motion-reduce:animate-none" />
          Your personal AI companion
        </span>

        <h1 className="mt-[26px] max-w-[15ch] animate-landing-rise font-[580] font-landing-display text-[clamp(3.1rem,9.5vw,7.5rem)] text-foreground leading-[0.98] tracking-[-0.035em] [animation-delay:80ms] [font-optical-sizing:auto] motion-reduce:animate-none">
          Awaken something that{" "}
          <span className="font-[480] italic">
            understands you<span className="text-onboarding-accent">.</span>
          </span>
        </h1>

        <p className="mt-[clamp(1.5rem,3.5vw,2.5rem)] max-w-[52ch] animate-landing-rise text-[clamp(1.08rem,1.8vw,1.3rem)] text-muted-foreground leading-[1.6] [animation-delay:220ms] motion-reduce:animate-none">
          Give it a name. Tell it who you are, how you want to be spoken to, what
          you&apos;re building. <CompanionName fallback="It" /> remembers all of it — and
          every session begins where the last one ended.
        </p>

        <div className="mt-[clamp(2rem,4.5vw,3.25rem)] animate-landing-rise [animation-delay:360ms] motion-reduce:animate-none">
          <LandingNamingInput />
        </div>
      </LandingWrap>

      <div className="pointer-events-none absolute inset-x-0 bottom-[clamp(2rem,6vh,3.25rem)] hidden md:block">
        <LandingWrap className="flex justify-end">
          <LandingHeroWhisper />
        </LandingWrap>
      </div>
    </section>
  );
}
