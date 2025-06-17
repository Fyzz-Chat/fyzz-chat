"use client";

import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useFileStore } from "@/stores/file-store";
import { useInputStore } from "@/stores/input-store";
import type { ClipboardEvent, KeyboardEvent } from "react";
import TextareaAutosize from "react-textarea-autosize";

export default function InputTextarea({
  imageSupport,
  pdfSupport,
  handleSendMessage,
}: {
  imageSupport?: boolean;
  pdfSupport?: boolean;
  handleSendMessage: (e: KeyboardEvent<HTMLTextAreaElement>) => Promise<void>;
}) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { input, setInput } = useInputStore();
  const { files, setFiles } = useFileStore();

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
      if (files) {
        Array.from(files).forEach((existingFile) => {
          newFiles.items.add(existingFile);
        });
      }

      const imageItems = Array.from(clipboardItems).filter(
        (item) =>
          item.type === "image/png" ||
          item.type === "image/jpeg" ||
          item.type === "image/jpg" ||
          item.type === "image/webp"
      );

      if (imageItems.length > 0 && imageSupport) {
        imageItems.forEach((imageItem) => {
          const file = imageItem.getAsFile();
          if (file) {
            newFiles.items.add(file);
          }
        });

        setFiles(newFiles.files);
      }

      const pdfItems = Array.from(clipboardItems).filter(
        (item) => item.type === "application/pdf"
      );

      if (pdfItems.length > 0 && pdfSupport) {
        pdfItems.forEach((pdfItem) => {
          const file = pdfItem.getAsFile();
          if (file) {
            newFiles.items.add(file);
          }
        });

        setFiles(newFiles.files);
      }
    }
  }

  return (
    <TextareaAutosize
      id="message-input"
      placeholder={isMobile ? "Enter message" : "(Shift + Enter for new line)"}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      rows={1}
      className="flex min-h-10 max-h-80 w-full bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-sm resize-none"
    />
  );
}
