"use client";

import { useEffect, useState } from "react";

export default function CatalystBadge() {
  const [source, setSource] = useState("");
  const medium = "utm_medium=referral";
  const campaign = "utm_campaign=made-with-badge";

  useEffect(() => {
    setSource(`utm_source=${globalThis.location.hostname}`);
  }, []);

  return (
    <a
      href={`https://catalyst.konvert7.com/?${source}&${medium}&${campaign}`}
      target="_blank"
      className="flex items-center gap-1.5 rounded border bg-card px-2 py-1 text-foreground text-sm shadow-md transition-colors hover:bg-input/50 dark:bg-input"
      rel="noopener"
    >
      <span>Made with</span>
      <img
        src="https://catalyst.konvert7.com/icon.svg"
        alt="Catalyst"
        width={20}
        height={20}
      />
      <span className="font-semibold">Catalyst</span>
    </a>
  );
}
