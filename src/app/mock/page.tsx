import MockLanding from "@/app/mock/mock-landing";
import ModelStoreInitializer from "@/components/chat/model-store-initializer";
import { caller } from "@/lib/trpc/server";

export default async function MockPage() {
  const providers = await caller.providers();

  return (
    <div className="h-svh overflow-auto">
      <ModelStoreInitializer providers={providers} />
      <MockLanding />
    </div>
  );
}
