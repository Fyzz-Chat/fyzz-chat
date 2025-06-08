"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Sidebar } from "../ui/sidebar";

export function SwipeDetector() {
  const { setOpenMobile } = useSidebar();
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const swiping = useRef(false);

  const handleTouchStart = (e: TouchEvent) => {
    // Only start swiping if the touch begins within 20px of the left edge
    if (e.touches[0].clientX <= 20) {
      swiping.current = true;
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (swiping.current) {
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    if (swiping.current) {
      const swipeDistance = touchEndX.current - touchStartX.current;
      if (swipeDistance > 50) {
        // Reduced distance for activation
        setOpenMobile(true);
      }
      swiping.current = false;
    }
  };

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return null;
}
