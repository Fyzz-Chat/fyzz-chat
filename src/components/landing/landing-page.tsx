import { LandingAphorism } from "@/components/landing/landing-aphorism";
import { LandingClosing } from "@/components/landing/landing-closing";
import { LandingControl } from "@/components/landing/landing-control";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingMasthead } from "@/components/landing/landing-masthead";
import { LandingMemory } from "@/components/landing/landing-memory";

export function LandingPage() {
  return (
    // `dark` pins the landing to its designed dark world regardless of the
    // visitor's stored app theme.
    <div className="dark relative w-full flex-1 overflow-x-clip bg-background font-landing-sans text-[1.0625rem] text-foreground leading-[1.6] antialiased">
      <LandingMasthead />
      <main>
        <LandingHero />
        <LandingAphorism />
        <LandingMemory />
        <LandingControl />
        <LandingClosing />
      </main>
      <LandingFooter />
    </div>
  );
}
