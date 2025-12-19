"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import useIsMac from "@/hooks/use-is-mac";
import { useTranslations } from "@/lib/contexts/translations-context";
import { cn, debounce } from "@/lib/utils";
import { useSearchStore } from "@/stores/search-store";

export function SearchField() {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const [search, setSearch] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { setSearchQuery } = useSearchStore();
  const isMac = useIsMac();
  const debouncedSetSearchQuery = useCallback(
    debounce((value: string) => setSearchQuery(value), 300),
    []
  );

  useEffect(() => {
    debouncedSetSearchQuery(search || undefined);
  }, [search, debouncedSetSearchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={translations.sidebar.search}
      />
      <div
        className={cn(
          "pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 items-center justify-center rounded-lg border bg-muted text-muted-foreground md:flex",
          isMac === undefined && "opacity-0"
        )}
      >
        <span className="text-xs">{isMac ? <Kbd>⌘ + K</Kbd> : <Kbd>Ctrl + K</Kbd>}</span>
      </div>
    </div>
  );
}
