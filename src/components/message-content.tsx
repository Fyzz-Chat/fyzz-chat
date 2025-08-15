"use client";

// xonokai, tomorrow, twilight, prism
import { Button } from "@/components/ui/button";

import ImageFilePart from "@/components/message/parts/image-file-part";
import PdfFilePart from "@/components/message/parts/pdf-file-part";
import TextPart from "@/components/message/parts/text-part";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn, tryParseJson } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import type { CustomUIMessage } from "@/types/chat";
import type { SourceUrlUIPart } from "ai";
import { Check, Copy } from "lucide-react";
import { marked } from "marked";
import { memo, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

const MemoizedSyntaxHighlighter = memo(
  ({
    language,
    children,
    ...props
  }: {
    language: string;
    children: string;
  }) => {
    return (
      <SyntaxHighlighter
        style={tomorrow}
        language={language}
        PreTag="div"
        className="rounded-md border !bg-sidebar/90 p-4 !text-sm"
        customStyle={{
          margin: 0,
          borderRadius: "0.375rem",
          fontSize: "14px !important",
          padding: "1rem !important",
        }}
        {...props}
      >
        {children}
      </SyntaxHighlighter>
    );
  },
  (prevProps, nextProps) =>
    prevProps.language === nextProps.language && prevProps.children === nextProps.children
);

const CodeBlock = memo(
  ({ language, children }: { language: string; children: string }) => {
    const [isRendered, setIsRendered] = useState(false);
    const [isStable, setIsStable] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const codeRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef(children);
    const timeoutRef = useRef<NodeJS.Timeout>(null);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(String(children));
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1500);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    };

    useEffect(() => {
      setIsStable(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (contentRef.current === children) {
          setIsStable(true);
        }
        contentRef.current = children;
      }, 500);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [children]);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsRendered(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      if (codeRef.current) {
        observer.observe(codeRef.current);
      }
      return () => observer.disconnect();
    }, []);

    return (
      <div className="relative my-2 overflow-x-auto group/code" ref={codeRef}>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 size-8 transition-opacity duration-100 z-10 ${
              isCopied ? "opacity-100" : "opacity-0 group-hover/code:opacity-100"
            }`}
            onClick={handleCopy}
          >
            {isCopied ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
          {isCopied && (
            <div className="absolute top-3 right-12 bg-background text-foreground px-2 py-1 rounded-md text-xs border shadow-md z-20">
              Copied!
            </div>
          )}
        </div>
        {isRendered && isStable ? (
          <MemoizedSyntaxHighlighter language={language}>
            {children.replace(/\n$/, "")}
          </MemoizedSyntaxHighlighter>
        ) : (
          <div className="bg-sidebar/90 p-4 rounded-md border !text-sm text-sidebar-foreground overflow-auto">
            <code
              style={{
                fontSize: "14px !important",
                lineHeight: "1.5",
                fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
              }}
            >
              {children}
            </code>
          </div>
        )}
      </div>
    );
  }
);

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <CodeBlock language={match[1]}>{String(children)}</CodeBlock>
            ) : (
              <span className="inline-block max-w-full overflow-x-auto overflow-y-hidden align-bottom">
                <code
                  className="bg-sidebar border text-sidebar-foreground px-1 py-0.5 rounded"
                  style={{ fontSize: "14px !important" }}
                  {...props}
                >
                  {children}
                </code>
              </span>
            );
          },
          p({ children }) {
            return <p className="mb-2 last:mb-0 leading-6">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-6 mb-2 space-y-2">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-7">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-xl font-bold mb-2 mt-6">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg font-bold mb-2 mt-6">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-md font-bold mb-2 mt-6">{children}</h3>;
          },
          a({ children, href }) {
            return (
              <a
                href={href}
                className="text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <ScrollArea className="w-full whitespace-nowrap">
                <table className="border-collapse">{children}</table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            );
          },
          img() {
            return null;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false;
    return true;
  }
);

function ReasoningPreview({
  reasoning,
  messageId,
  isLastPart,
}: { reasoning: string; messageId?: string; isLastPart: boolean }) {
  const [displayedReasoning, setDisplayedReasoning] = useState("");
  const [expressionIndex, setExpressionIndex] = useState(0);
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const expressions = [
    "Thinking",
    "Analyzing",
    "Gathering sources",
    "Collecting information",
    "Reasoning",
    "Concluding",
    "Scheming",
    "Plotting",
    "Brewing ideas",
    "Consulting the digital oracle",
    "Waking up the circuits",
    "Herding electrons",
  ];

  // Check for streaming reasoning from the chat store
  const lastMessage = useChatStore((state) => state.lastMessage);
  const status = useChatStore((state) => state.status);

  // Get streaming reasoning if this is the current message being streamed
  const streamingReasoning =
    lastMessage && lastMessage.id === messageId && status === "streaming"
      ? (lastMessage.parts?.find((part) => part.type === "reasoning") as any)
          ?.reasoningText || ""
      : "";

  // Use streaming reasoning if available, otherwise use the static reasoning
  const currentReasoning = streamingReasoning || reasoning;

  const isStreaming =
    lastMessage?.id === messageId && status === "streaming" && isLastPart;

  // Rotate expressions every 2 seconds when streaming
  useEffect(() => {
    if (lastMessage?.id !== messageId || status !== "streaming" || !isLastPart) {
      setExpressionIndex(0);
      setOutgoingIndex(null);
      return;
    }

    let animationTimeout: NodeJS.Timeout;
    const interval = setInterval(() => {
      setExpressionIndex((prevIndex) => {
        setOutgoingIndex(prevIndex);
        return (prevIndex + 1) % expressions.length;
      });

      animationTimeout = setTimeout(() => {
        setOutgoingIndex(null);
      }, 300); // Animation duration
    }, 1500);

    return () => {
      clearInterval(interval);
      if (animationTimeout) clearTimeout(animationTimeout);
    };
  }, [lastMessage?.id, messageId, status, expressions.length, isLastPart]);

  useEffect(() => {
    if (currentReasoning !== displayedReasoning) {
      // Only show content when there's actual reasoning
      if (currentReasoning.trim()) {
        setDisplayedReasoning(currentReasoning);

        // Only scroll to bottom while streaming
        if (isStreaming) {
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
          }, 50);
        }
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [currentReasoning, displayedReasoning, isStreaming]);

  // If no reasoning, don't show anything
  if (!currentReasoning.trim()) {
    return null;
  }

  const currentText = isStreaming ? expressions[expressionIndex] : "Thought process";

  return (
    <div className="relative flex flex-col items-start text-muted-foreground gap-2 text-xs w-full max-w-xs">
      {/* Animated expression */}
      <div className="relative text-start h-4 w-full">
        {outgoingIndex !== null && isStreaming && (
          <p className="animate-slide-up-out absolute inset-0">
            {expressions[outgoingIndex]}
          </p>
        )}
        <p
          key={currentText}
          className={cn(
            "absolute inset-0",
            outgoingIndex !== null ? "animate-slide-in-from-bottom" : ""
          )}
        >
          {currentText}
        </p>
      </div>

      {/* Preview window with blurred borders */}
      <div className="relative h-16 overflow-hidden rounded-md border border-border/50 bg-muted/20">
        {/* Top blur gradient */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none" />

        {/* Bottom blur gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />

        {/* Scrolling text content */}
        <div
          ref={scrollRef}
          className="px-3 py-2 h-full overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="text-xs text-muted-foreground leading-relaxed text-left">
            {displayedReasoning}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MessageContent({ message }: { message: CustomUIMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex flex-col gap-2 items-end w-full">
        {/* NOTE: Everything is a part in v5 */}
        {message.parts?.map((part, index) => {
          if (part.type === "file") {
            if (part.mediaType?.startsWith("image/")) {
              const name = part.filename;
              const url = part.url;

              return (
                <ImageFilePart
                  key={`${message.id}-attachment-${index}`}
                  url={url}
                  name={name}
                />
              );
            }

            if (part.mediaType?.startsWith("application/pdf")) {
              return <PdfFilePart key={`${message.id}-attachment-${index}`} />;
            }

            return null;
          } else if (part.type === "text") {
            return <TextPart key={`${message.id}-text-${index}`}>{part.text}</TextPart>;
          } else {
            return null;
          }
        })}
      </div>
    );
  }

  if (message.role === "assistant") {
    return (
      <div className="flex flex-col gap-4 min-h-6">
        {message.parts?.map((part, index) => {
          if (part.type === "text") {
            const blocks = parseMarkdownIntoBlocks(part.text);
            return (
              <div key={`${message.id}-block-${index}`} className="flex flex-col gap-1">
                {blocks.map((block, index) => (
                  <div
                    key={`${message.id}-block-${index}`}
                    className="break-words"
                    style={{ wordBreak: "break-word" }}
                  >
                    <MemoizedMarkdownBlock content={block} />
                  </div>
                ))}
              </div>
            );
          }
          if (part.type === "tool-memory") {
            return (
              <div key={`${message.id}-tool-result-${index}`}>
                <p className="text-sm text-muted-foreground leading-6">Memory updated</p>
              </div>
            );
          }
          if (part.type === "reasoning") {
            return (
              <Sheet key={`${message.id}-reasoning-${index}`}>
                <SheetTrigger className="mr-auto">
                  <ReasoningPreview
                    reasoning={part.text}
                    messageId={message.id}
                    isLastPart={index === (message.parts?.length || 0) - 1}
                  />
                </SheetTrigger>
                <SheetContent className="px-0">
                  <SheetHeader className="px-6">
                    <SheetTitle>Reasoning</SheetTitle>
                    <SheetDescription className="sr-only">
                      Thought process of the model
                    </SheetDescription>
                  </SheetHeader>
                  <div className="relative h-full pt-4 pb-6">
                    <div className="absolute top-4 left-0 right-0 w-full h-4 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
                    <ScrollArea className="h-full px-6">
                      <p className="text-sm text-muted-foreground pt-2 pb-4 leading-6">
                        {part.text}
                      </p>
                    </ScrollArea>
                    <div className="absolute bottom-6 left-0 right-0 w-full h-6 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
                  </div>
                </SheetContent>
              </Sheet>
            );
          }
          if (part.type === "tool-generateImage" && part.state === "output-available") {
            return (
              <div
                key={`${message.id}-tool-result-${index}`}
                className="flex flex-col gap-2"
              >
                <img
                  className="w-full sm:w-[60%] h-auto object-contain rounded-lg"
                  key={`${message.id}-tool-result-${index}`}
                  src={(part.output as any).image}
                  alt={(part.output as any).name}
                />
              </div>
            );
          }
        })}
        {message.parts?.some((part) => part.type === "source-url") && (
          <div className="flex flex-col gap-2">
            {message.parts
              ?.filter((part) => part.type === "source-url")
              .map((part, index) => {
                const sourcePart = part as SourceUrlUIPart;
                return (
                  <a
                    key={`source-${sourcePart.sourceId}`}
                    href={sourcePart.url}
                    target="_blank"
                    className="text-blue-400 hover:underline"
                  >
                    [{index + 1}] {sourcePart.url}
                  </a>
                );
              })}
          </div>
        )}
      </div>
    );
  }
}
