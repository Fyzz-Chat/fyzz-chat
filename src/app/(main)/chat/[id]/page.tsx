import type { Metadata, ResolvingMetadata } from "next";
import ChatMessageList from "@/components/chat/message-list";
import { getConversation } from "@/lib/dao/conversations";

type Props = Readonly<{
  params: Promise<{ id: string }>;
}>;

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const conversation = await getConversation(id);
  const parentTitle = (await parent).title ?? undefined;

  return {
    title: conversation?.title ? `Fyzz chat - ${conversation.title}` : parentTitle,
  };
}

export default async function ChatIdPage({ params }: Props) {
  const { id } = await params;
  return <ChatMessageList id={id} />;
}
