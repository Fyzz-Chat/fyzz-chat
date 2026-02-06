"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { useInitialMessage } from "@/lib/contexts/initial-message-context";
import { useMockInput } from "@/lib/contexts/mock-input-context";
import { useModelStore } from "@/stores/model-store";

export default function MockLanding() {
  const router = useRouter();
  const { setInitialMessage, setInitialModel, setInitialBrowse, setInitialFiles } =
    useInitialMessage();
  const model = useModelStore((state) => state.model);
  const { setHandlers, setStatus } = useMockInput();

  useEffect(() => {
    setStatus("ready");
    setHandlers({
      onSubmit: (message: PromptInputMessage) => {
        if (!message.text) return;
        const id = crypto.randomUUID();
        setInitialMessage(message.text);
        setInitialModel(model.id);
        setInitialBrowse(false);
        setInitialFiles(message.files || []);
        router.push(`/mock/${id}`);
      },
    });
  }, [
    model.id,
    router,
    setHandlers,
    setStatus,
    setInitialMessage,
    setInitialModel,
    setInitialBrowse,
    setInitialFiles,
  ]);

  return null;
}
