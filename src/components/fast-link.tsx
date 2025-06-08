"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";

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
    const router = useRouter();
    const navigatedRef = useRef(false);

    function handleMouseDown(e: React.MouseEvent<HTMLAnchorElement>) {
      e.preventDefault();
      navigatedRef.current = true;
      router.push(props.href.toString());
    }

    function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
      if (navigatedRef.current) {
        e.preventDefault();
        navigatedRef.current = false;
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
