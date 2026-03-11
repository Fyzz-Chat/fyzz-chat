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
import { useProject } from "@/lib/queries/projects";
import { useModelStore } from "@/stores/model-store";

interface ProjectInfoProps {
  id: string;
  initialProject?: { id: string; name: string; description: string | null } | null;
}

export function ProjectInfo({ id, initialProject }: Readonly<ProjectInfoProps>) {
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
    <>
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
    </>
  );
}
