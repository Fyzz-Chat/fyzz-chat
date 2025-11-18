"use client";

import { useEffect, useState } from "react";

interface Status {
  openai: boolean;
  claude: boolean;
  all: boolean;
}

export function useStatus() {
  const [status, setStatus] = useState<Status>({
    openai: true,
    claude: true,
    all: true,
  });

  useEffect(() => {
    isHealthy("openai").then((openai) => {
      setStatus((prev) => ({ ...prev, openai, all: openai && prev.all }));
    });
    isHealthy("claude").then((claude) => {
      setStatus((prev) => ({ ...prev, claude, all: claude && prev.all }));
    });
  }, []);

  return status;
}

export async function isHealthy(service: "openai" | "claude") {
  const response = await fetch(`https://status.${service}.com/api/v2/summary.json`);

  if (!response.ok) {
    return false;
  }

  const data = await response.json();

  const status = data.status.description;
  const statusOk = status === "All Systems Operational";

  return statusOk;
}
