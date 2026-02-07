"use client";

import Link from "next/link";
import type * as React from "react";
import { useCallback } from "react";

export function FastLink({
  className,
  children,
  prefetchFunction,
  href,
  onClick,
  ...props
}: React.ComponentProps<typeof Link> & {
  prefetchFunction?: () => void;
}) {
  const isTouchDevice = useCallback(() => {
    return "ontouchstart" in globalThis || navigator.maxTouchPoints > 0;
  }, []);

  function handleMouseDown(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isTouchDevice()) return;

    if (e.button !== 0) return;
    e.preventDefault();
    const anchor = (e.target as HTMLElement).closest("a");
    if (anchor) {
      anchor.click();
    }
  }

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!isTouchDevice() && e.isTrusted && e.detail !== 0) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  }

  function handleMouseEnter() {
    if (prefetchFunction) {
      prefetchFunction();
    }
  }

  return (
    <Link
      data-slot="fast-link"
      href={href}
      {...props}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={className}
    >
      {children}
    </Link>
  );
}
