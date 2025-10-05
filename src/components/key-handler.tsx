"use client";

import { useEffect } from "react";

export function KeyHandler({
  keyString,
  handler,
}: {
  keyString: string;
  handler: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === keyString) {
        handler();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [keyString, handler]);

  return null;
}
