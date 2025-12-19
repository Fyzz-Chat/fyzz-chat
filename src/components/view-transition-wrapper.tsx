"use client";

import { type ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function ViewTransitionWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div
      className={cn(
        "transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}
