"use client";

import { useCallback, useState } from "react";
import type { BrowseState } from "@/types/browse";

export const useBrowse = (): BrowseState => {
  const [browse, setBrowseValue] = useState(false);

  const setBrowse = useCallback((value: boolean) => {
    setBrowseValue(value);
  }, []);

  return {
    browse,
    setBrowse,
  };
};
