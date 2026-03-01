"use client";

import { Split } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageAction } from "@/components/ai-elements/message";
import { branchConversationAction } from "@/lib/actions/conversations";

interface MessageBranchActionProps {
  messageId: string;
  conversationId: string;
}

export default function MessageBranchAction({
  messageId,
  conversationId,
}: Readonly<MessageBranchActionProps>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleBranch() {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await branchConversationAction(conversationId, messageId);
      router.push(`/chat/${result.newConversationId}`);
    } catch (error) {
      console.error("Failed to branch conversation:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <MessageAction
      label="Branch"
      tooltip="Branch conversation here"
      onClick={handleBranch}
      disabled={isLoading}
    >
      <Split className="size-4" />
    </MessageAction>
  );
}
