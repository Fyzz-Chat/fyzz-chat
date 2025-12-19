"use client";

import { useEffect, useState } from "react";

export default function useIsMac() {
  const [isMac, setIsMac] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const platform = globalThis.navigator.platform.toLowerCase();
    setIsMac(platform.includes("mac"));
  }, []);

  return isMac;
}
