"use client";

import type { SourceUrlUIPart } from "ai";
import type { HTMLAttributes } from "react";
import { useMemo } from "react";
import {
  InlineCitation,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationCarouselNext,
  InlineCitationCarouselPrev,
  InlineCitationSource,
} from "@/components/ai-elements/inline-citation";
import { badgeVariants } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type CitationInlineProps = HTMLAttributes<HTMLElement> & {
  sources: SourceUrlUIPart[];
  "data-indices"?: string;
  node?: unknown;
};

export function CitationInline({
  sources,
  "data-indices": dataIndices,
  node: _node,
  children: _children,
  ...props
}: CitationInlineProps) {
  const resolvedSources = useMemo(() => {
    if (!dataIndices) return [];
    return dataIndices
      .split(",")
      .map((i) => sources[Number(i) - 1])
      .filter(Boolean);
  }, [dataIndices, sources]);

  if (resolvedSources.length === 0) return null;

  const firstUrl = resolvedSources[0].url;
  let triggerLabel: string;
  try {
    triggerLabel = new URL(firstUrl).hostname;
  } catch {
    triggerLabel = "source";
  }
  if (resolvedSources.length > 1) {
    triggerLabel += ` +${resolvedSources.length - 1}`;
  }

  return (
    <InlineCitation {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <span
            className={cn(
              badgeVariants({ variant: "secondary" }),
              "ml-1 cursor-pointer rounded-full"
            )}
          >
            {triggerLabel}
          </span>
        </PopoverTrigger>
        <PopoverContent className="relative w-80 p-0">
          <InlineCitationCarousel>
            <InlineCitationCarouselHeader>
              <InlineCitationCarouselPrev />
              <InlineCitationCarouselNext />
              <InlineCitationCarouselIndex />
            </InlineCitationCarouselHeader>
            <InlineCitationCarouselContent>
              {resolvedSources.map((source) => (
                <InlineCitationCarouselItem
                  key={source.sourceId}
                  className="min-w-0 overflow-hidden"
                >
                  <InlineCitationSource
                    title={source.title}
                    url={(() => {
                      try {
                        const url = new URL(source.url);
                        url.searchParams.set("utm_source", "fyzz.chat");
                        url.searchParams.set("utm_medium", "referral");
                        url.searchParams.set("utm_campaign", "citation");
                        return url.toString();
                      } catch {
                        return source.url;
                      }
                    })()}
                  />
                </InlineCitationCarouselItem>
              ))}
            </InlineCitationCarouselContent>
          </InlineCitationCarousel>
        </PopoverContent>
      </Popover>
    </InlineCitation>
  );
}
