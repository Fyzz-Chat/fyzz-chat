"use client";

import Link from "next/link";
import type * as React from "react";
import { useCallback, useState } from "react";

/**
 * This component is a wrapper around the Next.js Link component.
 *
 * It achieves seemingly faster navigation by navigating on the mouse down event
 * instead of the click event, while maintaining compatibility with touch devices.
 */
export function FastLink({
  className,
  children,
  prefetchFunction,
  ...props
}: React.ComponentProps<typeof Link> & {
  prefetchFunction?: () => void;
}) {
  const [active, setActive] = useState(false);
  const isTouchDevice = useCallback(() => {
    return "ontouchstart" in globalThis || navigator.maxTouchPoints > 0;
  }, []);

  function handleMouseDown(e: React.MouseEvent<HTMLAnchorElement>) {
    // Skip fast-click behavior on touch devices
    if (isTouchDevice()) return;

    if (e.button !== 0) return;
    e.preventDefault();
    const anchor = (e.target as HTMLElement).closest("a");
    if (anchor) {
      anchor.click();
    }
  }

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Only prevent click on non-touch devices since we're using mousedown there,
    // but allow click if it comes from a keyboard event
    if (!isTouchDevice() && e.isTrusted && e.detail !== 0) {
      e.preventDefault();
    }
    props.onClick?.(e);
  }

  function handleMouseEnter() {
    setActive(true);
    if (prefetchFunction) {
      prefetchFunction();
    }
  }

  return (
    <Link
      data-slot="fast-link"
      {...props}
      prefetch={active ? null : false}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  );
}
