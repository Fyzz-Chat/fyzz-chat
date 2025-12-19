"use client";

import { type FormEvent, type KeyboardEvent, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ActionButton from "@/components/input-form/action-button";
import AttachmentButton from "@/components/input-form/attachment-button";
import CameraCaptureInput from "@/components/input-form/camera-capture-input";
import FileList from "@/components/input-form/file-list";
import FileUploadInput from "@/components/input-form/file-upload-input";
import InputTextarea from "@/components/input-form/input-textarea";
import SearchMenu from "@/components/input-form/search-menu";
import ModelMenu from "@/components/model-menu";
import useTempChat from "@/hooks/use-temp-chat";
import {
  useAddMessage,
  useCreateConversation,
  useCreateConversationOptimistic,
} from "@/lib/queries/conversations";
import { cn, isFileList, uploadFiles } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import { useFileStore } from "@/stores/file-store";
import { useInputStore } from "@/stores/input-store";
import { useModelStore } from "@/stores/model-store";
import type { CustomUIMessage, PartialConversation } from "@/types/chat";

export default function InputForm({ className }: { className?: string }) {
  useTempChat();
  const navigate = useNavigate();
  const location = useLocation();
  const createConversation = useCreateConversation();
  const createConversationOptimistic = useCreateConversationOptimistic();
  const addMessage = useAddMessage();

  const model = useModelStore((state) => state.model);
  const temporaryChat = useModelStore((state) => state.temporaryChat);

  const files = useFileStore((state) => state.files);
  const setFiles = useFileStore((state) => state.setFiles);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  async function handleSendMessage(
    e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>
  ) {
    const { input, setInput } = useInputStore.getState();
    const { stableId, status } = useChatStore.getState();

    e.preventDefault();
    if (!input.trim()) return;

    if (status !== "ready") return;

    if (location.pathname === "/chat") {
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
      navigate(url);
    }

    const fileUIParts = await uploadFiles(stableId, files);
    setFiles(fileUIParts);

    const { setChatInput } = useChatStore.getState();
    const messageId = setChatInput(input);

    const parts: CustomUIMessage["parts"] = [];

    if (isFileList(files)) {
      for (const file of Array.from(files)) {
        parts.push({
          type: "file",
          mediaType: file.type,
          filename: file.name,
          url: URL.createObjectURL(file),
        });
      }
    } else {
      for (const fileUIPart of fileUIParts) {
        parts.push({
          type: "file",
          mediaType: fileUIPart.mediaType,
          filename: fileUIPart.filename,
          url: fileUIPart.url,
        });
      }
    }

    parts.push({
      type: "text",
      text: input,
    });

    await addMessage.mutateAsync({
      message: {
        id: messageId,
        role: "user",
        parts: parts,
        model: model.id,
        metadata: {
          model: model.id,
          content: input,
          createdAt: new Date(),
          reasoningDurations: [],
        },
      },
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
        "w-full flex-none rounded-b-[20px] bg-background pt-1 sm:px-4 sm:pb-4",
        className
      )}
    >
      <form
        onSubmit={handleSendMessage}
        className={cn(
          "flex flex-col items-end rounded-t-3xl border bg-card p-3 transition-colors duration-200 focus-within:border-primary sm:rounded-b-3xl",
          temporaryChat && "dark:bg-black"
        )}
      >
        <FileList />
        <InputTextarea handleSendMessage={handleSendMessage} />
        <CameraCaptureInput ref={cameraInputRef} />
        <FileUploadInput ref={fileInputRef} />
        <div className="flex w-full items-center gap-2">
          <div className="mr-auto flex items-center gap-2">
            <ModelMenu />
            <SearchMenu />
          </div>
          {model?.extensions?.length > 0 && (
            <AttachmentButton
              cameraInputRef={cameraInputRef}
              fileInputRef={fileInputRef}
            />
          )}
          <ActionButton />
        </div>
      </form>
    </div>
  );
}
