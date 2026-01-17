"use client";

import { createContext, useContext } from "react";
import type { BrowseState } from "@/types/browse";

export const BrowseContext = createContext<BrowseState | null>(null);

export const useBrowseContext = () => {
  const context = useContext(BrowseContext);
  if (!context) {
    throw new Error("useBrowseContext must be used within BrowseProvider");
  }
  return context;
};
