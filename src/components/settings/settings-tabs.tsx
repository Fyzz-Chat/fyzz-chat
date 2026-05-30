"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Tabs } from "@/components/ui/tabs";

const VALID_TABS = [
  "memory",
  "security",
  "account",
  "display",
  "api-keys",
  "mcp",
  "skills",
] as const;

const DEFAULT_TAB = "memory";

export function SettingsTabs({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const param = searchParams.get("tab");
  const value = VALID_TABS.includes(param as (typeof VALID_TABS)[number])
    ? (param as string)
    : DEFAULT_TAB;

  function handleChange(next: string) {
    const params = new URLSearchParams(searchParams);
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Tabs value={value} onValueChange={handleChange} className={className}>
      {children}
    </Tabs>
  );
}
