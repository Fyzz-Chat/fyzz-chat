"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

const VERSION_CHECK_INTERVAL = 60000; // Check every minute
const BROWSER_VERSION_KEY = "browser_version";

function compareVersions(vServer: string, vBrowser: string): number {
  const vServerParts = vServer.split(".").map(Number);
  const vBrowserParts = vBrowser.split(".").map(Number);
  const maxLength = Math.max(vServerParts.length, vBrowserParts.length);

  for (let i = 0; i < maxLength; i++) {
    const vServerPart = vServerParts[i] || 0;
    const vBrowserPart = vBrowserParts[i] || 0;
    if (vServerPart > vBrowserPart) return 1;
    if (vServerPart < vBrowserPart) return -1;
  }
  return 0;
}

async function checkVersion() {
  const response = await fetch("/api/health");
  if (!response.ok) throw new Error("Failed to fetch version");
  const data = await response.json();
  return data.version as string;
}

export function VersionChecker() {
  const toastShownRef = useRef(false);

  const { data: serverVersion } = useQuery({
    queryKey: ["version"],
    queryFn: checkVersion,
    refetchInterval: VERSION_CHECK_INTERVAL,
    staleTime: VERSION_CHECK_INTERVAL,
  });

  useEffect(() => {
    sessionStorage.removeItem(BROWSER_VERSION_KEY);
  }, []);

  useEffect(() => {
    if (!serverVersion) return;

    const browserVersion = sessionStorage.getItem(BROWSER_VERSION_KEY);

    if (!browserVersion) {
      sessionStorage.setItem(BROWSER_VERSION_KEY, serverVersion);
      return;
    }

    if (compareVersions(serverVersion, browserVersion) > 0 && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.info("A new version is available", {
        description: "Please reload the page to see the update",
        action: {
          label: "Reload",
          onClick: () => {
            globalThis.location.reload();
          },
        },
        duration: Infinity,
      });
    }
  }, [serverVersion]);

  return null;
}
