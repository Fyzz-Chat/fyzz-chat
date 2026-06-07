import { LandingAphorism } from "@/components/landing/landing-aphorism";
import { LandingClosing } from "@/components/landing/landing-closing";
import { LandingControl } from "@/components/landing/landing-control";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingMasthead } from "@/components/landing/landing-masthead";
import { LandingMemory } from "@/components/landing/landing-memory";
import { LandingThread } from "@/components/landing/landing-thread";
import "@/components/landing/landing.css";

export function LandingPage() {
  return (
    <div className="landing relative w-full flex-1 overflow-x-clip bg-landing-paper font-landing-sans text-[1.0625rem] text-landing-ink leading-[1.6] antialiased">
      <LandingThread />
      <div className="relative z-2 bg-background text-foreground">
        <LandingMasthead />
        <LandingHero />
        <LandingAphorism />
        <LandingMemory />
        <LandingControl />
      </div>
      <main className="relative z-2">
        <LandingClosing />
      </main>
      <LandingFooter />
    </div>
  );
}
