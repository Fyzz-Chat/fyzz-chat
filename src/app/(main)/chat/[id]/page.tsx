import ChatMessageList from "@/components/chat/message-list";
import {
  MESSAGES_DEFAULT_LIMIT,
  MESSAGES_DEFAULT_PAGE,
} from "@/lib/queries/conversations";
import { getQueryClient, HydrateClient, trpc } from "@/lib/trpc/server";

type Props = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function ChatIdPage({ params }: Props) {
  const { id } = await params;
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(trpc.conversation.queryOptions({ id })),
    queryClient.prefetchQuery(
      trpc.messages.queryOptions({
        id,
        page: MESSAGES_DEFAULT_PAGE,
        limit: MESSAGES_DEFAULT_LIMIT,
      })
    ),
  ]);
  return (
    <HydrateClient>
      <ChatMessageList id={id} />
    </HydrateClient>
  );
}
