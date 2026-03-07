import ChatMessageList from "@/components/chat/message-list";

export default async function ChatIdPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  return <ChatMessageList id={id} />;
}
