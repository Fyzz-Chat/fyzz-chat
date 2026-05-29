import { LandingWrap } from "./landing-wrap";

export function LandingBeforeAfter() {
  return (
    <section
      id="how"
      className="scroll-mt-20 py-[clamp(2.5rem,7vh,5rem)] pb-[clamp(3.75rem,10vh,7.5rem)]"
    >
      <LandingWrap>
        <h2 className="mb-10 max-w-[20ch] animate-landing-rise font-landing-display font-medium text-[clamp(1.6rem,4vw,2.6rem)] tracking-[-0.02em] motion-reduce:animate-none">
          Your day, before and after the re-briefing stops.
        </h2>
        <div className="grid animate-landing-rise grid-cols-1 overflow-hidden rounded-[4px] border border-landing-line [animation-delay:100ms] motion-reduce:animate-none min-[760px]:grid-cols-2">
          <div className="border-landing-line border-b bg-landing-paper p-[clamp(1.625rem,3vw,2.75rem)] min-[760px]:border-r min-[760px]:border-b-0">
            <div className="mb-[18px] flex items-center gap-[10px] text-[11px] text-landing-ink-faint uppercase tracking-[0.24em]">
              <span>Before</span>
              <span className="h-px flex-1 bg-current opacity-40" />
            </div>
            <p className="text-[clamp(1rem,1.5vw,1.18rem)] text-landing-ink-dim leading-[1.58]">
              Every chat starts from zero. You re-explain the same client, the same
              context, the same way you like things done — five times a day. One model is
              never right for everything, so you jump tools, copy-paste across, and lose
              the thread.
            </p>
          </div>
          <div className="bg-landing-ink p-[clamp(1.625rem,3vw,2.75rem)] text-landing-paper">
            <div className="mb-[18px] flex items-center gap-[10px] text-[#e5b8a8] text-[11px] uppercase tracking-[0.24em]">
              <span>After — with Fyzz</span>
              <span className="h-px flex-1 bg-current opacity-40" />
            </div>
            <p className="text-[clamp(1rem,1.5vw,1.18rem)] leading-[1.58]">
              Fyzz already knows your client, your style, your past work —{" "}
              <b className="font-semibold text-white">no re-briefing.</b> In one
              conversation you pick the right model for each step — research, reasoning,
              drafting — without losing context.{" "}
              <span className="font-landing-display text-landing-accent italic">
                You're in control; you're just not starting over.
              </span>
            </p>
          </div>
        </div>
      </LandingWrap>
    </section>
  );
}
