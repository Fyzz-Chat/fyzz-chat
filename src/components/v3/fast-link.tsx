"use client";

import React, { useCallback } from "react";
import { Link, type LinkProps } from "react-router-dom";

type FastLinkProps = LinkProps & {
  children: React.ReactNode;
  className?: string;
  prefetchFunction?: () => void;
};

/**
 * This component is a wrapper around the Next.js Link component.
 *
 * It achieves seemingly faster navigation by navigating on the mouse down event
 * instead of the click event, while maintaining compatibility with touch devices.
 */
export const FastLink = React.forwardRef<HTMLAnchorElement, FastLinkProps>(
  ({ className, children, prefetchFunction, ...props }, ref) => {
    const isTouchDevice = useCallback(() => {
      return "ontouchstart" in window || navigator.maxTouchPoints > 0;
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
      if (prefetchFunction) {
        prefetchFunction();
      }
    }

    return (
      <Link
        ref={ref}
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
);

FastLink.displayName = "FastLink";
