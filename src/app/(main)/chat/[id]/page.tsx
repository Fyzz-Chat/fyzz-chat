import ChatMessageList from "@/components/chat/message-list";

type Props = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function ChatIdPage({ params }: Props) {
  const { id } = await params;
  return <ChatMessageList id={id} />;
}
