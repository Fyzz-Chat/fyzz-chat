"use client";

import { cn } from "@/lib/utils";
import { useLandingNameStore } from "@/stores/landing-name-store";
import { AnimatedName } from "./animated-name";

// The companion's first words back — appears only once the visitor has
// named it (settled input), rises softly, and signs with the given name.
export function LandingHeroWhisper() {
  const settledName = useLandingNameStore((s) => s.settledName);
  const visible = Boolean(settledName);

  return (
    <div aria-hidden={!visible} className="text-right">
      <p
        className={cn(
          "font-landing-display text-[15px] text-foreground/45 italic leading-snug transition-all duration-700 ease-out [font-optical-sizing:auto] motion-reduce:transition-none",
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        )}
      >
        &ldquo;You only have to tell me once.&rdquo;
      </p>
      <p className="mt-1 min-h-5 text-[12.5px] text-onboarding-accent/80">
        <AnimatedName text={settledName ? `— ${settledName}` : ""} />
      </p>
    </div>
  );
}
