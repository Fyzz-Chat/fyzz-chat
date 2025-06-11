import { MessageContent } from "@/components/message-content";
import { ScrollArea } from "@/components/ui/scroll-area";
import conf from "@/lib/config";
import { public_getConversationUntilMessage } from "@/lib/dao/conversations";
import { cn } from "@/lib/utils";
import jwt from "jsonwebtoken";
import { notFound } from "next/navigation";

export default async function SharePage({
  params,
}: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const tokenData = jwt.verify(token, conf.jwtSecret) as { messageId: string };

  const conversation = await public_getConversationUntilMessage(tokenData.messageId);

  if (!conversation || !conversation.messages) {
    return notFound();
  }

  return (
    <>
      <div className="relative h-6 -mb-6 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
      <ScrollArea className="h-[calc(100svh-72px-62px)] px-4 mx-4">
        <div className="flex flex-1 flex-col gap-8 max-w-5xl w-full mx-auto my-6">
          {conversation.messages.map((message: any) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col gap-1 group",
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
      <div className="relative h-6 -mt-6 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
    </>
  );
}
