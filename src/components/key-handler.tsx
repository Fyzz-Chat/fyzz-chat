"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function KeyHandler({
  keyString,
  handler,
}: {
  keyString: string;
  handler: () => void;
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
  }, [keyString, handler]);

  return null;
}

export function HomeHandler() {
  const navigate = useNavigate();

  function handler() {
    navigate("/chat");
    document.getElementById("message-input")?.focus();
  }

  return <KeyHandler keyString="n" handler={handler} />;
}

export function EnterHandler() {
  function handler() {
    document.getElementById("message-input")?.focus();
  }
  return <KeyHandler keyString="Enter" handler={handler} />;
}

export function EscapeHandler() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        document.getElementById("message-input")?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
