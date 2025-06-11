"use client";

import { useEffect } from "react";

export function ScrollToBottom() {
  useEffect(() => {
    const viewport = document.querySelector("[data-radix-scroll-area-viewport]");

    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, []);

  return null;
}
