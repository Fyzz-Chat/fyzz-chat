"use client";

import { Split } from "lucide-react";
import { MessageAction } from "@/components/ai-elements/message";

interface MessageBranchActionProps {
  messageId: string;
  conversationId: string;
}

export default function MessageBranchAction({
  messageId,
  conversationId,
}: Readonly<MessageBranchActionProps>) {
  function handleBranch() {
    console.log(
      "Branch conversation at message:",
      messageId,
      "in conversation:",
      conversationId
    );
    // TODO: Implement branching logic
  }

  return (
    <MessageAction
      label="Branch"
      tooltip="Branch conversation here"
      onClick={handleBranch}
    >
      <Split className="size-4" />
    </MessageAction>
  );
}
