"use client";

import { useChatContext } from "@/lib/contexts/chat-context";
import {
  useAddMessage,
  useCreateConversation,
  useCreateConversationOptimistic,
} from "@/lib/queries/conversations";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, type KeyboardEvent, forwardRef, useEffect, useRef } from "react";

import CameraCaptureInput from "@/components/input-form/camera-capture-input";
import FileList from "@/components/input-form/file-list";
import FileUploadInput from "@/components/input-form/file-upload-input";

import ActionButton from "@/components/input-form/action-button";
import AttachmentButton from "@/components/input-form/attachment-button";
import InputTextarea from "@/components/input-form/input-textarea";
import useTempChat from "@/hooks/use-temp-chat";
import { cn } from "@/lib/utils";
import { useFileStore } from "@/stores/file-store";
import { useInputStore } from "@/stores/input-store";
import { useModelStore } from "@/stores/model-store";
import type { PartialConversation } from "@/types/chat";
import type { Attachment } from "ai";
import dynamic from "next/dynamic";

const LazyModelMenu = dynamic(() => import("@/components/model-menu"));

function fileToAttachment(file: File): Attachment {
  return {
    name: file.name,
    contentType: file.type,
    url: URL.createObjectURL(file),
  };
}

const InputForm = forwardRef<HTMLTextAreaElement, { className?: string }>(
  ({ className }, ref) => {
    useTempChat();
    const router = useRouter();
    const pathname = usePathname();
    const createConversation = useCreateConversation();
    const createConversationOptimistic = useCreateConversationOptimistic();
    const addMessage = useAddMessage();
    const { input, setInput } = useInputStore();
    const { model, temporaryChat } = useModelStore();
    const { stableId, status, setChatInput } = useChatContext();
    const { files } = useFileStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const imageSupport = model?.features?.some((feature) => feature.name === "Images");
    const pdfSupport = model?.features?.some((feature) => feature.name === "PDFs");

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

      const messageId = setChatInput(input);
      await addMessage.mutateAsync({
        message: {
          id: messageId,
          content: input,
          role: "user",
          experimental_attachments: files ? Array.from(files).map(fileToAttachment) : [],
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

    useEffect(() => {
      const storedInput = localStorage.getItem("fyzz-input-content");
      if (storedInput) {
        setInput(storedInput);
      }
    }, []);

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
            "flex flex-col items-end border rounded-t-xl sm:rounded-b-xl p-4 bg-card transition-colors",
            temporaryChat && "dark:bg-black"
          )}
        >
          <FileList />
          <InputTextarea
            ref={ref}
            handleSendMessage={handleSendMessage}
            imageSupport={imageSupport}
            pdfSupport={pdfSupport}
          />
          <CameraCaptureInput ref={cameraInputRef} />
          <FileUploadInput
            ref={fileInputRef}
            imageSupport={imageSupport}
            pdfSupport={pdfSupport}
          />
          <div className="flex items-center w-full gap-2">
            <div className="flex items-center gap-2 mr-auto">
              <LazyModelMenu />
            </div>
            <AttachmentButton
              imageSupport={imageSupport}
              pdfSupport={pdfSupport}
              cameraInputRef={cameraInputRef}
              fileInputRef={fileInputRef}
            />
            <ActionButton />
          </div>
        </form>
      </div>
    );
  }
);

InputForm.displayName = "InputForm";

export default InputForm;
