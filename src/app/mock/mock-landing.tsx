"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { useInitialMessage } from "@/lib/contexts/initial-message-context";
import { useMockInput } from "@/lib/contexts/mock-input-context";
import { useModelStore } from "@/stores/model-store";

export default function MockLanding() {
  const router = useRouter();
  const { setInitialMessage, setInitialModel, setInitialBrowse, setInitialFiles } =
    useInitialMessage();
  const model = useModelStore((state) => state.model);
  const setDefaultModel = useModelStore((state) => state.setDefaultModel);
  const { setHandlers, setStatus } = useMockInput();

  useEffect(() => {
    setDefaultModel();
  }, [setDefaultModel]);

  useEffect(() => {
    setStatus("ready");
    setHandlers({
      onSubmit: (message: PromptInputMessage) => {
        if (!message.text) return;
        const id = uuidv4();
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

  return (
    <div className="flex h-full items-end justify-center">
      <Image src="/icon.svg" alt="Fyzz.chat" width={100} height={100} />
    </div>
  );
}
