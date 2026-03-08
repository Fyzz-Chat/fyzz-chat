"use client";

import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown plugins={{ math, code }} className={cn(className)} {...props} />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
