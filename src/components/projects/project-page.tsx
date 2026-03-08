"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import ChatInput from "@/components/chat/chat-input";
import { useChatInput } from "@/lib/contexts/chat-input-context";
import { useInitialMessage } from "@/lib/contexts/initial-message-context";
import { useConversations } from "@/lib/queries/conversations";
import { useProject } from "@/lib/queries/projects";
import { getMessageContent } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import type { ConversationPage } from "@/types/chat";

interface ProjectPageProps {
  id: string;
  initialProject?: { id: string; name: string; description: string | null } | null;
  initialConversations?: ConversationPage;
}

export function ProjectPage({
  id,
  initialProject,
  initialConversations,
}: Readonly<ProjectPageProps>) {
  const router = useRouter();
  const { data: project } = useProject(id, initialProject);
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
  const { data: conversationsData } = useConversations(true, {
    initialData: initialConversations ?? emptyPage,
    projectId: id,
  });
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

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col gap-6 p-4 pt-16">
      <Link
        href="/projects"
        className="group flex items-center gap-1 text-muted-foreground text-sm transition-color duration-200 hover:text-foreground"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:translate-x-[-2px]" />
        Back to projects
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-2xl">{project.name}</h1>
        {project.description ? (
          <p className="text-muted-foreground text-sm">{project.description}</p>
        ) : null}
      </div>

      <ChatInput />

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
              className="flex items-start justify-between gap-3 rounded-lg p-3 text-sm transition-colors hover:bg-muted"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate">{conversation.title}</div>
                {conversation.messages.length > 0 && (
                  <p className="truncate text-muted-foreground text-xs">
                    {getMessageContent(
                      conversation.messages[conversation.messages.length - 1]
                    )}
                  </p>
                )}
              </div>
              <span className="shrink-0 pt-0.5 text-muted-foreground text-xs">
                {new Date(conversation.lastMessageAt).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
