"use client";

import { useEffect, useState } from "react";

interface Status {
  openai: boolean;
  all: boolean;
}

export function useStatus() {
  const [status, setStatus] = useState<Status>({
    openai: true,
    all: true,
  });

  useEffect(() => {
    isOpenAIHealthy().then((openai) => {
      setStatus({ ...status, openai, all: openai && status.all });
    });
  }, []);

  return status;
}

export async function isOpenAIHealthy() {
  const response = await fetch("https://status.openai.com/api/v2/summary.json");

  if (!response.ok) {
    return false;
  }

  const data = await response.json();

  const status = data.status.description;
  const statusOk = status === "All Systems Operational";

  return statusOk;
}
