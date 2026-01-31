import MockMessageList from "@/app/mock/[id]/message-list";
import { caller } from "@/lib/trpc/server";

export default async function MockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conversation = await caller.conversation({ id }).catch(() => null);
  const messages = conversation ? await caller.messages({ id }) : { messages: [] };

  return (
    <MockMessageList
      id={id}
      initialModel={conversation?.model}
      initialMessages={messages.messages}
    />
  );
}
