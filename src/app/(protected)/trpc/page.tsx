import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";
import { ClientGreeting } from "./client-greeting";

export default async function Home() {
  prefetch(trpc.hello.queryOptions({ text: "world" }));

  return (
    <HydrateClient>
      <div>...</div>
      <ClientGreeting />
    </HydrateClient>
  );
}
