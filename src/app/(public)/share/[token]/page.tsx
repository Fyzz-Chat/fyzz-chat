import jwt from "jsonwebtoken";
import type { Metadata, ResolvedMetadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { MessageContent } from "@/components/message-content";
import { ScrollToBottom } from "@/components/share/scroll-to-bottom";
import { ScrollArea } from "@/components/ui/scroll-area";
import conf from "@/lib/config";
import { public_getConversationUntilMessage } from "@/lib/dao/conversations";
import { canonicalUrl, openGraph, twitter } from "@/lib/metadata";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<ResolvedMetadata | Metadata> {
  const { token } = await params;

  const tokenData = jwt.verify(token, conf.jwtSecret) as { messageId: string };

  const conversation = await public_getConversationUntilMessage(tokenData.messageId);

  if (conversation) {
    return {
      alternates: {
        canonical: `${canonicalUrl}/share/${token}`,
      },
      robots: "noindex, nofollow",
      title: conversation.title,
      openGraph: {
        ...openGraph,
        title: conversation.title,
      },
      twitter: {
        ...twitter,
        title: conversation.title,
      },
    };
  }

  return parent;
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const tokenData = jwt.verify(token, conf.jwtSecret) as { messageId: string };

  const conversation = await public_getConversationUntilMessage(tokenData.messageId);

  if (!conversation || !conversation.messages) {
    return notFound();
  }

  return (
    <>
      <div className="-mb-6 pointer-events-none relative z-10 h-6 bg-linear-to-b from-background to-transparent" />
      <ScrollArea className="mx-4 h-[calc(100svh-72px-62px)] px-4">
        <div className="mx-auto my-6 flex w-full max-w-5xl flex-1 flex-col gap-8">
          {conversation.messages.map((message: any) => (
            <div
              key={message.id}
              className={cn(
                "group flex flex-col gap-1",
                message.role === "user"
                  ? "ml-auto max-w-[80%] items-end"
                  : "mr-auto max-w-full"
              )}
            >
              <MessageContent message={message} />
            </div>
          ))}
        </div>
      </ScrollArea>
      <ScrollToBottom />
      <div className="-mt-6 pointer-events-none relative z-10 h-6 bg-linear-to-t from-background to-transparent" />
    </>
  );
}
