import ModelStoreInitializer from "@/components/chat/model-store-initializer";
import { caller } from "@/lib/trpc/server";
import MockMessageList from "./message-list";

export default async function MockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const providers = await caller.providers();

  return (
    <div className="h-[calc(100svh-170px)] overflow-auto md:h-[calc(100svh-130px)]">
      <ModelStoreInitializer providers={providers} />
      <MockMessageList id={id} />
    </div>
  );
}
