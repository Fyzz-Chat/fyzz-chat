import { redirect } from "next/navigation";
import ModelStoreInitializer from "@/components/chat/model-store-initializer";
import { caller } from "@/lib/trpc/server";
import MockMessageList from "./message-list";

export default async function MockPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { id } = await params;
  const { new: isNew } = await searchParams;

  const [providers, conversation] = await Promise.all([
    caller.providers(),
    caller.conversation({ id }).catch(() => null),
  ]);

  if (!conversation && !isNew) {
    redirect("/mock");
  }

  const messages = conversation ? await caller.messages({ id }) : { messages: [] };

  return (
    <div className="h-svh overflow-auto">
      <ModelStoreInitializer providers={providers} />
      <MockMessageList
        id={id}
        initialModel={conversation?.model}
        initialMessages={messages.messages}
      />
    </div>
  );
}
