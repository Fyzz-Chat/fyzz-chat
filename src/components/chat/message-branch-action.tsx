"use client";

import { Split } from "lucide-react";
import { useRouter } from "next/navigation";
import { MessageAction } from "@/components/ai-elements/message";
import { useBranchConversation } from "@/lib/queries/conversations";

interface MessageBranchActionProps {
  messageId: string;
  conversationId: string;
}

export default function MessageBranchAction({
  messageId,
  conversationId,
}: Readonly<MessageBranchActionProps>) {
  const router = useRouter();
  const branchMutation = useBranchConversation();

  async function handleBranch() {
    if (branchMutation.isPending) return;

    try {
      const result = await branchMutation.mutateAsync({
        conversationId,
        messageId,
      });
      router.push(`/chat/${result.newConversationId}`);
    } catch (error) {
      console.error("Failed to branch conversation:", error);
    }
  }

  return (
    <MessageAction
      label="Branch"
      tooltip="Start new conversation from here"
      onClick={handleBranch}
      disabled={branchMutation.isPending}
    >
      <Split className="size-4" />
    </MessageAction>
  );
}
