import ModelStoreInitializer from "@/components/chat/model-store-initializer";
import { caller } from "@/lib/trpc/server";
import MockMessageList from "./message-list";

export default async function MockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const providers = await caller.providers();

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <ModelStoreInitializer providers={providers} />
      <MockMessageList id={id} />
    </div>
  );
}
