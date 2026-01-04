import jwt from "jsonwebtoken";
import type { Metadata, ResolvedMetadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { MessageContent } from "@/components/message-content";
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
    <div className="relative h-[calc(100svh-72px-62px)]">
      <div className="flex h-full flex-col">
        <div className="pointer-events-none relative z-10 -mb-6 h-6 bg-linear-to-b from-background to-transparent" />
        <Conversation>
          <ConversationContent className="mx-auto max-w-5xl">
            {/** biome-ignore lint/suspicious/noExplicitAny: TODO: Need further investigation */}
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
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <div className="pointer-events-none relative z-10 -mt-6 h-6 bg-linear-to-t from-background to-transparent" />
      </div>
    </div>
  );
}
