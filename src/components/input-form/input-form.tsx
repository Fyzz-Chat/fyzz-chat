"use client";

import { useChatContext } from "@/lib/contexts/chat-context";
import {
  useAddMessage,
  useCreateConversation,
  useCreateConversationOptimistic,
} from "@/lib/queries/conversations";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, type KeyboardEvent, useEffect, useRef } from "react";

import CameraCaptureInput from "@/components/input-form/camera-capture-input";
import FileList from "@/components/input-form/file-list";
import FileUploadInput from "@/components/input-form/file-upload-input";

import ActionButton from "@/components/input-form/action-button";
import AttachmentButton from "@/components/input-form/attachment-button";
import InputTextarea from "@/components/input-form/input-textarea";
import useTempChat from "@/hooks/use-temp-chat";
import { cn, fileToAttachment, isFileList, uploadFiles } from "@/lib/utils";
import { useFileStore } from "@/stores/file-store";
import { useInputStore } from "@/stores/input-store";
import { useModelStore } from "@/stores/model-store";
import type { PartialConversation } from "@/types/chat";
import type { Translations } from "@/types/locale";
import dynamic from "next/dynamic";

const LazyModelMenu = dynamic(() => import("@/components/model-menu"));

export default function InputForm({
  className,
  translations,
}: { className?: string; translations: Translations["input"] }) {
  useTempChat();
  const router = useRouter();
  const pathname = usePathname();
  const createConversation = useCreateConversation();
  const createConversationOptimistic = useCreateConversationOptimistic();
  const addMessage = useAddMessage();
  const { stableId, status, setChatInput } = useChatContext();

  const input = useInputStore((state) => state.input);
  const setInput = useInputStore((state) => state.setInput);

  const model = useModelStore((state) => state.model);
  const temporaryChat = useModelStore((state) => state.temporaryChat);

  const files = useFileStore((state) => state.files);
  const setFiles = useFileStore((state) => state.setFiles);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  async function handleSendMessage(
    e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>
  ) {
    e.preventDefault();
    if (!input.trim()) return;

    if (status !== "ready") return;

    if (pathname === "/chat") {
      const optimisticConversation: PartialConversation = {
        id: stableId,
        title: "New Chat",
        model: model.id,
        messages: [],
        lastMessageAt: new Date(),
      };

      if (temporaryChat) {
        await createConversationOptimistic.mutateAsync(optimisticConversation);
      } else {
        await createConversation.mutateAsync(optimisticConversation);
      }

      const url = temporaryChat ? `/chat/${stableId}/temp` : `/chat/${stableId}`;
      router.push(url);
    }

    const attachments = await uploadFiles(stableId, files);
    setFiles(attachments);

    const messageId = setChatInput(input);
    await addMessage.mutateAsync({
      message: {
        id: messageId,
        content: input,
        role: "user",
        experimental_attachments: isFileList(files)
          ? Array.from(files).map((file) =>
              fileToAttachment(file, URL.createObjectURL(file))
            )
          : attachments,
        model: model.id,
      },
      conversationId: stableId,
    });
    setInput("");
    localStorage.removeItem("fyzz-input-content");
  }

  useEffect(() => {
    if (!files && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (files && cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  }, [files]);

  return (
    <div
      className={cn(
        "flex-none pt-1 sm:px-4 sm:pb-4 w-full bg-background rounded-b-[20px]",
        className
      )}
    >
      <form
        onSubmit={handleSendMessage}
        className={cn(
          "flex flex-col items-end border rounded-t-xl sm:rounded-b-xl p-4 bg-card transition-colors duration-200 focus-within:border-primary",
          temporaryChat && "dark:bg-black"
        )}
      >
        <FileList />
        <InputTextarea
          handleSendMessage={handleSendMessage}
          translations={translations}
        />
        <CameraCaptureInput ref={cameraInputRef} />
        <FileUploadInput ref={fileInputRef} />
        <div className="flex items-center w-full gap-2">
          <div className="flex items-center gap-2 mr-auto">
            <LazyModelMenu translations={translations.modelMenu} />
          </div>
          <AttachmentButton
            cameraInputRef={cameraInputRef}
            fileInputRef={fileInputRef}
            translations={translations.attach}
          />
          <ActionButton />
        </div>
      </form>
    </div>
  );
}
