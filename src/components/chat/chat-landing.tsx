"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { useChatInput } from "@/lib/contexts/chat-input-context";
import { useInitialMessage } from "@/lib/contexts/initial-message-context";
import { useModelStore } from "@/stores/model-store";

export default function ChatLanding() {
  const router = useRouter();
  const { setInitialMessage, setInitialModel, setInitialBrowse, setInitialFiles } =
    useInitialMessage();
  const setDefaultModel = useModelStore((state) => state.setDefaultModel);
  const { setHandlers, setStatus, browseRef } = useChatInput();

  useEffect(() => {
    setDefaultModel();
  }, [setDefaultModel]);

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
      <Image src="/icon.svg" alt="Fyzz.chat" width={100} height={100} />
    </div>
  );
}
