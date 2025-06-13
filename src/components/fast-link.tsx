"use client";

import Link, { type LinkProps } from "next/link";
import React from "react";

type FastLinkProps = LinkProps & {
  children: React.ReactNode;
  className?: string;
};

/**
 * This component is a wrapper around the Next.js Link component.
 *
 * It achieves seemingly faster navigation by navigating on the mouse down event
 * instead of the click event.
 */
export const FastLink = React.forwardRef<HTMLAnchorElement, FastLinkProps>(
  ({ className, children, ...props }, ref) => {
    function handleMouseDown(e: React.MouseEvent<HTMLAnchorElement>) {
      if (e.button !== 0) return;
      e.preventDefault();
      const anchor = (e.target as HTMLElement).closest("a");
      if (anchor) {
        anchor.click();
      }
    }

    function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
      // Prevent click again since we're using mouse down, but
      // allow click if it comes from a keyboard event
      if (e.isTrusted && e.detail !== 0) {
        e.preventDefault();
      }
      props.onClick?.(e);
    }

    return (
      <Link
        ref={ref}
        {...props}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        className={className}
      >
        {children}
      </Link>
    );
  }
);

FastLink.displayName = "FastLink";
