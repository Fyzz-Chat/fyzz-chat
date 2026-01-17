"use client";

import { type ClipboardEvent, type KeyboardEvent, use } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useInputFormContext } from "@/lib/contexts/input-form-context";
import { useTranslations } from "@/lib/contexts/translations-context";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { isFileList } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import type { ExtensionType } from "@/types/provider";

export default function InputTextarea({
  handleSendMessage,
}: Readonly<{
  handleSendMessage: (e: KeyboardEvent<HTMLTextAreaElement>) => Promise<void>;
}>) {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { input, setInput, files, setFiles } = useInputFormContext();
  const extensions = useModelStore((state) => state.model?.extensions);

  async function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !isMobile) {
      e.preventDefault();
      await handleSendMessage(e);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const clipboardItems = e.clipboardData.items;

    // Check if clipboard contains any files
    const hasFiles = Array.from(clipboardItems).some((item) => item.kind === "file");

    if (hasFiles) {
      e.preventDefault();

      const newFiles = new DataTransfer();
      // First add existing files if any
      if (isFileList(files)) {
        Array.from(files).forEach((existingFile) => {
          newFiles.items.add(existingFile);
        });
      }

      Array.from(clipboardItems).forEach((item) => {
        if (extensions?.includes(item.type as ExtensionType)) {
          const file = item.getAsFile();
          if (file) {
            newFiles.items.add(file);
          }
        }
      });

      setFiles(newFiles.files);
    }
  }

  return (
    <TextareaAutosize
      id="message-input"
      placeholder={
        isMobile
          ? translations.input.placeholder.mobile
          : translations.input.placeholder.desktop
      }
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      rows={1}
      className="flex max-h-80 min-h-10 w-full resize-none bg-transparent p-1 text-base placeholder:text-muted-foreground focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
    />
  );
}
