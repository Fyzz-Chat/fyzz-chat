import { LandingWrap } from "./landing-wrap";

const TILES = [
  {
    num: "01 / Memory",
    val: "Knows your clients",
    desc: "It carries your context and style across every chat — and compounds the more you use it.",
  },
  {
    num: "02 / Models",
    val: "Your pick, any step",
    desc: "Research, reasoning, drafting — switch models mid-conversation. You decide, not a black box.",
  },
  {
    num: "03 / Uptime",
    val: "6 providers",
    desc: 'When one provider goes down, you switch to another and keep working. No "the AI\'s offline."',
  },
  {
    num: "04 / Sources",
    val: "Cite-ready",
    desc: "Answers come with sources — so what lands in your client's deck is something you can defend.",
  },
];

export function LandingProof() {
  return (
    <section className="py-[clamp(2.875rem,8vh,5.75rem)]">
      <LandingWrap className="animate-landing-rise overflow-hidden rounded-[4px] border border-landing-line motion-reduce:animate-none">
        <div className="grid grid-cols-1 gap-px bg-landing-line min-[460px]:grid-cols-2 min-[880px]:grid-cols-4">
          {TILES.map((t) => (
            <div
              key={t.num}
              className="bg-landing-paper p-[clamp(1.375rem,2.4vw,2.125rem)] transition-colors hover:bg-landing-paper-2"
            >
              <div className="font-bold text-[10.5px] text-landing-accent uppercase tracking-[0.2em]">
                {t.num}
              </div>
              <div className="mt-[14px] mb-2 font-[560] font-landing-display text-[clamp(1.5rem,2.4vw,2.05rem)] leading-[1.05] tracking-[-0.02em]">
                {t.val}
              </div>
              <div className="text-[13.5px] text-landing-ink-dim leading-[1.5]">
                {t.desc}
              </div>
            </div>
          ))}
        </div>
      </LandingWrap>
    </section>
  );
}
