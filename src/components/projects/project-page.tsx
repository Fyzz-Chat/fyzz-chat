"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { useChatInput } from "@/lib/contexts/chat-input-context";
import { useInitialMessage } from "@/lib/contexts/initial-message-context";
import { useConversations } from "@/lib/queries/conversations";
import { useProject } from "@/lib/queries/projects";
import { useModelStore } from "@/stores/model-store";

export function ProjectPage({ id }: Readonly<{ id: string }>) {
  const router = useRouter();
  const { data: project, isPending: isProjectPending } = useProject(id);
  const {
    setInitialMessage,
    setInitialModel,
    setInitialBrowse,
    setInitialFiles,
    setInitialProjectId,
  } = useInitialMessage();
  const setDefaultModel = useModelStore((state) => state.setDefaultModel);
  const userDefaultModelId = useModelStore((state) => state.userDefaultModelId);
  const { setHandlers, setStatus, browseRef } = useChatInput();

  const emptyPage = { items: [], nextCursor: undefined };
  const { data: conversationsData } = useConversations(emptyPage, true, undefined, id);
  const conversations = conversationsData?.pages.flatMap((page) => page.items) ?? [];

  useEffect(() => {
    setDefaultModel(userDefaultModelId);
  }, [setDefaultModel, userDefaultModelId]);

  useEffect(() => {
    setStatus("ready");
    setHandlers({
      onSubmit: (message: PromptInputMessage) => {
        if (!message.text) return;
        const chatId = uuidv4();
        const currentModel = useModelStore.getState().model;
        const modelId = currentModel?.id;
        setInitialMessage(message.text);
        if (modelId) {
          setInitialModel(modelId);
        } else {
          setInitialModel(null);
        }
        setInitialBrowse(browseRef.current);
        setInitialFiles(message.files || []);
        setInitialProjectId(id);
        router.push(`/chat/${chatId}`);
      },
    });
  }, [
    router,
    setHandlers,
    setStatus,
    setInitialMessage,
    setInitialModel,
    setInitialBrowse,
    setInitialFiles,
    setInitialProjectId,
    browseRef,
    id,
  ]);

  if (isProjectPending) {
    return null;
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col gap-6 p-4 pt-12 md:p-8 md:pt-12">
      <h1 className="font-semibold text-2xl">{project.name}</h1>

      {conversations.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No conversations yet. Send a message to start one.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/chat/${conversation.id}`}
              className="flex items-center justify-between rounded-lg p-3 text-sm transition-colors hover:bg-muted"
            >
              <span className="truncate">{conversation.title}</span>
              <span className="shrink-0 text-muted-foreground text-xs">
                {new Date(conversation.lastMessageAt).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
