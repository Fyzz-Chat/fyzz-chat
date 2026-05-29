import { LandingWrap } from "./landing-wrap";

export function LandingAphorism() {
  return (
    <section className="mt-[18px] animate-landing-rise border-landing-ink border-y py-[clamp(3.125rem,9vh,6.5rem)] motion-reduce:animate-none">
      <LandingWrap className="grid grid-cols-1 items-start gap-[6px] min-[620px]:grid-cols-[auto_1fr] min-[620px]:gap-[clamp(1.25rem,4vw,3.5rem)]">
        <div
          aria-hidden="true"
          className="font-landing-display font-semibold text-[3rem] text-landing-accent leading-[0.7] min-[620px]:text-[clamp(4rem,9vw,8rem)]"
        >
          “
        </div>
        <blockquote className="max-w-[22ch] font-[360] font-landing-display text-[clamp(1.7rem,4.4vw,3.5rem)] italic leading-[1.18] tracking-[-0.018em]">
          An assistant you re-brief every morning isn't a partner —{" "}
          <em className="text-landing-accent italic">
            it's a stranger who happens to type fast.
          </em>
        </blockquote>
      </LandingWrap>
    </section>
  );
}
