"use client";

import { cn, debounce } from "@/lib/utils";
import { useSearchStore } from "@/stores/search-store";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";

function useIsMac() {
  const [isMac, setIsMac] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const platform = window.navigator.platform.toLowerCase();
    setIsMac(platform.includes("mac"));
  }, []);

  return isMac;
}

export function SearchField() {
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
        placeholder="Search..."
      />
      <div
        className={cn(
          "hidden md:flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none px-1 py-0.5 rounded-[4px] bg-muted border",
          isMac === undefined && "opacity-0"
        )}
      >
        <span className="text-xs">{isMac ? "⌘+K" : "Ctrl+K"}</span>
      </div>
    </div>
  );
}
