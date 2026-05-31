import { redirect } from "next/navigation";
import OnboardingForm from "@/components/onboarding/onboarding-form";
import conf from "@/lib/config";
import { getUserFromSession } from "@/lib/dao/users";

export default async function OnboardingPage() {
  if (!conf.onboardingEnabled) redirect("/chat");

  const user = await getUserFromSession();
  if (user.onboardingCompletedAt) redirect("/chat");

  return (
    <main className="flex min-h-full flex-col bg-background">
      <section className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-5 py-16 md:grid-cols-[0.9fr_1.1fr] md:px-10">
        <div className="space-y-7">
          <div className="space-y-4">
            <p className="font-medium text-muted-foreground text-sm">First-run setup</p>
            <h1 className="text-balance font-semibold text-4xl tracking-normal md:text-5xl">
              Tune Fyzz before the first chat.
            </h1>
            <p className="max-w-md text-muted-foreground text-sm leading-6">
              Persona and memory setup happens directly in your profile. No chat is
              created, and no message quota is touched.
            </p>
          </div>
          <div className="grid gap-3 text-sm md:max-w-sm">
            <div className="border-foreground border-l-2 py-1 pl-4">
              <div className="font-medium">Persona</div>
              <div className="text-muted-foreground">Names for you and the agent.</div>
            </div>
            <div className="border-border border-l-2 py-1 pl-4">
              <div className="font-medium">Memory</div>
              <div className="text-muted-foreground">A few durable preferences.</div>
            </div>
            <div className="border-border border-l-2 py-1 pl-4">
              <div className="font-medium">Then chat</div>
              <div className="text-muted-foreground">Land in the normal workspace.</div>
            </div>
          </div>
        </div>
        <OnboardingForm initialDisplayName={user.name} />
      </section>
    </main>
  );
}
