"use client";

import { useMediaQuery } from "@/lib/hooks/use-media-query";

export default function IntroDialogDescription() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return isMobile ? "icon" : "name";
}
