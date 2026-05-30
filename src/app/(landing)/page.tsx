import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LandingPage } from "@/components/landing/landing-page";

// Read the gate per-request (runtime) so a single build behaves differently per
// deployment: OSS / self-host leaves LANDING_PAGE_ENABLED unset → the app is the
// entry point; the commercial deploy sets it → the marketing landing renders.
export const dynamic = "force-dynamic";

export default async function Home() {
  if (process.env.LANDING_PAGE_ENABLED !== "true") {
    redirect("/chat");
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    redirect("/chat");
  }

  return <LandingPage />;
}
