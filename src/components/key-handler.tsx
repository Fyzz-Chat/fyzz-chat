"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";

export function KeyHandler({
  keyString,
  handler,
  dependencies = [],
}: {
  keyString: string;
  handler: () => void;
  dependencies?: unknown[];
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the user is currently typing in an input field
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true" ||
        target.closest('[contenteditable="true"]');

      // Only trigger handler if not typing and key matches
      if (!isTyping && e.key === keyString) {
        e.preventDefault();
        e.stopPropagation();
        handler();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [keyString, handler, ...dependencies]);

  return null;
}

export function HomeHandler() {
  const router = useRouter();

  function handler() {
    router.push("/chat");
    focusInput();
  }

  return <KeyHandler keyString="n" handler={handler} />;
}

export function ModelMenuHandler() {
  const setModelMenuOpen = useUIStore((state) => state.setModelMenuOpen);

  function handler() {
    setModelMenuOpen((open) => !open);
  }

  return <KeyHandler keyString="m" handler={handler} dependencies={[setModelMenuOpen]} />;
}

function focusInput() {
  const el = document.getElementById("message-input") as HTMLTextAreaElement | null;
  if (!el) return;
  el.focus();
  el.selectionStart = el.selectionEnd = el.value.length;
}

export function EnterHandler() {
  return <KeyHandler keyString="Enter" handler={focusInput} />;
}

export function EscapeHandler() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        (e.target as HTMLElement).blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
