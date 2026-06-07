import { cn } from "@/lib/utils";
import { CompanionName } from "./companion-name";
import { LandingWrap } from "./landing-wrap";
import { Reveal } from "./reveal";

// Block 4 — "The Control". Dusk after the memory section's dawn: the light
// recedes as the page descends toward the threshold. Memory said it knows
// you; Control says nobody can take it from you.
const TILES = [
  {
    num: "01 / Models",
    title: "Any mind, any step",
    desc: "Every frontier model, swappable mid-conversation. You decide, not a black box.",
  },
  {
    num: "02 / Providers",
    title: "Six labs deep",
    desc: "When a provider stumbles, you switch and keep working. Your companion doesn’t have outages.",
  },
  {
    num: "03 / Sources",
    title: "Answers you can defend",
    desc: "Citations on every claim, so what reaches your client’s deck is yours to stand behind.",
  },
];

const TILE_STAGGER_MS = 160;

export function LandingControl() {
  return (
    <section className="relative py-[clamp(4.5rem,13vh,8.5rem)]">
      {/* Dusk ember — high behind the headline, draining toward the tiles. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute top-0 left-1/2 mt-[-100px] ml-[-480px] h-[480px] w-[960px] animate-onboarding-breathe rounded-full bg-[radial-gradient(ellipse,var(--onboarding-accent),transparent_70%)] blur-3xl [animation-delay:-3s] motion-reduce:animate-none" />
      </div>

      <LandingWrap className="relative">
        <Reveal>
          <span className="inline-flex items-center gap-[9px] text-[10.5px] text-onboarding-accent uppercase tracking-[0.24em]">
            <span className="size-[7px] animate-landing-pulse rounded-full bg-onboarding-accent motion-reduce:animate-none" />
            Control
          </span>
          <h2 className="mt-5 max-w-[20ch] font-[560] font-landing-display text-[clamp(2.2rem,5.5vw,4rem)] text-foreground leading-[1.05] tracking-[-0.03em] [font-optical-sizing:auto]">
            The model is replaceable.{" "}
            <em className="text-onboarding-accent italic">
              <CompanionName fallback="Your companion" /> isn’t.
            </em>
          </h2>
          <p className="mt-6 max-w-[52ch] text-[clamp(1.02rem,1.6vw,1.18rem)] text-muted-foreground leading-[1.6]">
            Research on one mind, reason on another, draft on a third —{" "}
            <CompanionName fallback="it" /> stays itself: same memory, same voice,
            whichever model the moment needs.
          </p>
        </Reveal>

        <div className="mt-[clamp(3rem,7vh,4.5rem)] grid grid-cols-1 min-[880px]:grid-cols-[1fr_1px_1fr_1px_1fr]">
          {TILES.map((tile, i) => (
            <div key={tile.num} className="contents">
              {i > 0 && (
                <div
                  aria-hidden="true"
                  className="h-px w-full bg-gradient-to-r from-transparent via-foreground/15 to-transparent min-[880px]:h-full min-[880px]:w-px min-[880px]:bg-gradient-to-b"
                />
              )}
              <Reveal
                delayMs={i * TILE_STAGGER_MS}
                className={cn(
                  "py-7 min-[880px]:px-[clamp(1.5rem,3vw,2.5rem)] min-[880px]:py-0",
                  i === 0 && "pt-0 min-[880px]:pl-0",
                  i === TILES.length - 1 && "pb-0 min-[880px]:pr-0"
                )}
              >
                <div className="text-[10.5px] text-onboarding-accent uppercase tracking-[0.2em]">
                  {tile.num}
                </div>
                <div className="mt-[14px] mb-2 font-[560] font-landing-display text-[clamp(1.4rem,2.2vw,1.9rem)] text-foreground leading-[1.1] tracking-[-0.02em]">
                  {tile.title}
                </div>
                <div className="text-[14px] text-muted-foreground leading-[1.55]">
                  {tile.desc}
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </LandingWrap>
    </section>
  );
}
