"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { FyzzLogo } from "@/components/fyzz-logo";
import { useChatInput } from "@/lib/contexts/chat-input-context";
import { useInitialMessage } from "@/lib/contexts/initial-message-context";
import { useModelStore } from "@/stores/model-store";

export default function ChatLanding() {
  const router = useRouter();
  const { setInitialMessage, setInitialModel, setInitialBrowse, setInitialFiles } =
    useInitialMessage();
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
        const id = uuidv4();
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
        router.push(`/chat/${id}`);
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
    browseRef,
  ]);

  return (
    <div className="flex h-full items-end justify-center">
      <FyzzLogo width={90} height={44} />
    </div>
  );
}
