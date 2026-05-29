export function LandingThread() {
  return (
    <div className="l-thread" aria-hidden="true">
      <svg viewBox="0 0 80 2400" preserveAspectRatio="none">
        <title>Decorative continuous thread</title>
        <path
          pathLength={1}
          d="M40 0 C 40 180, 8 300, 40 460 C 70 600, 14 720, 40 900 C 64 1060, 18 1180, 40 1360 C 60 1540, 20 1660, 40 1860 C 58 2040, 26 2180, 40 2400"
          className="animate-landing-draw fill-none stroke-landing-accent opacity-[0.85] [stroke-dasharray:1] [stroke-dashoffset:1] [stroke-width:2] motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
        />
      </svg>
    </div>
  );
}
