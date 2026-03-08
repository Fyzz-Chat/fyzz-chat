"use client";

import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function Pad({ children }: Readonly<{ children: ReactNode }>) {
  const params = useParams<{ id: string }>();
  const id = params.id;

  return (
    <div
      className={cn(
        "md:px-4",
        id
          ? "absolute right-0 bottom-0 left-0 md:bottom-4"
          : "relative flex flex-1 items-start"
      )}
    >
      {children}
    </div>
  );
}
