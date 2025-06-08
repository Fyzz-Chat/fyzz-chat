import { MessagesList } from "@/components/message-list";
import MessagesScrollArea from "@/components/messages-scroll-area";
import { getUserIdFromSession } from "@/lib/dao/users";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await getUserIdFromSession();

  const { id } = await params;
  return (
    <MessagesScrollArea className="relative h-[calc(100svh-114px)] md:h-[calc(100svh-142px)]">
      <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent pointer-events-none z-10 rounded-t-xl" />
      <MessagesList id={id} />
    </MessagesScrollArea>
  );
}
