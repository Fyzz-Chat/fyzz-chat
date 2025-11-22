"use client";

import { useTranslations } from "@/lib/contexts/translations-context";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { isFileList } from "@/lib/utils";
import { useFileStore } from "@/stores/file-store";
import { useInputStore } from "@/stores/input-store";
import { useModelStore } from "@/stores/model-store";
import { type ClipboardEvent, type KeyboardEvent, use, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";

export default function InputTextarea({
  handleSendMessage,
}: {
  handleSendMessage: (e: KeyboardEvent<HTMLTextAreaElement>) => Promise<void>;
}) {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const input = useInputStore((state) => state.input);
  const setInput = useInputStore((state) => state.setInput);
  const files = useFileStore((state) => state.files);
  const setFiles = useFileStore((state) => state.setFiles);
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
        if (extensions?.includes(item.type)) {
          const file = item.getAsFile();
          if (file) {
            newFiles.items.add(file);
          }
        }
      });

      setFiles(newFiles.files);
    }
  }

  useEffect(() => {
    const storedInput = localStorage.getItem("fyzz-input-content");
    if (storedInput) {
      setInput(storedInput);
    }
  }, []);

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
      className="flex min-h-10 max-h-80 w-full bg-transparent placeholder:text-muted-foreground focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 text-base sm:text-sm resize-none"
    />
  );
}
