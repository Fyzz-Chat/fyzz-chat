import type { SourceUrlUIPart } from "ai";
import { useMemo } from "react";

type Source = {
  url: string;
  hostname: string;
  title?: string;
};

function toSource(part: SourceUrlUIPart): Source | null {
  try {
    const parsed = new URL(part.url);
    return { url: part.url, hostname: parsed.hostname, title: part.title };
  } catch {
    return null;
  }
}

function dedupeByHostname(sources: Source[]): Source[] {
  const seen = new Set<string>();
  const out: Source[] = [];
  for (const source of sources) {
    if (seen.has(source.url)) continue;
    seen.add(source.url);
    out.push(source);
  }
  return out;
}

export function MessageSources({ sources }: Readonly<{ sources: SourceUrlUIPart[] }>) {
  const items = useMemo(
    () =>
      dedupeByHostname(
        sources.map(toSource).filter((source): source is Source => source !== null)
      ),
    [sources]
  );

  if (items.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-border/60 border-t pt-3">
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        Sources
      </span>
      {items.map((source, index) => (
        <a
          key={source.url}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          title={source.title ?? source.url}
          className="inline-flex max-w-[18rem] items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground text-xs transition-colors hover:bg-secondary/70"
        >
          <img
            src={`https://www.google.com/s2/favicons?domain=${source.hostname}&sz=32`}
            alt=""
            className="size-3.5 shrink-0 rounded-sm"
            loading="lazy"
          />
          <span className="truncate">
            {index + 1}. {source.hostname}
          </span>
        </a>
      ))}
    </div>
  );
}
