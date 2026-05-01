"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { useChatInput } from "@/lib/contexts/chat-input-context";
import { useInitialMessage } from "@/lib/contexts/initial-message-context";
import { useModelStore } from "@/stores/model-store";

export default function ProjectHandlers({ id }: Readonly<{ id: string }>) {
  const router = useRouter();
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

  return null;
}
