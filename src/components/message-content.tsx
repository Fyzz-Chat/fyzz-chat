// xonokai, tomorrow, twilight, prism
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Message } from "ai";
import { Copy, FileText } from "lucide-react";
import { marked } from "marked";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

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
        className="rounded-md border !bg-sidebar/90 p-4"
        customStyle={{
          margin: 0,
          borderRadius: "0.375rem",
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
    const codeRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef(children);
    const timeoutRef = useRef<NodeJS.Timeout>(null);

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
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 size-8 opacity-0 group-hover/code:opacity-100 transition-opacity duration-100 z-10"
          onClick={() => navigator.clipboard.writeText(String(children))}
        >
          <Copy className="size-4" />
        </Button>
        {isRendered && isStable ? (
          <MemoizedSyntaxHighlighter language={language}>
            {children.replace(/\n$/, "")}
          </MemoizedSyntaxHighlighter>
        ) : (
          <div className="bg-sidebar/90 p-[1em] rounded-md border text-base text-sidebar-foreground overflow-auto">
            <code>{children}</code>
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
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <CodeBlock language={match[1]}>{String(children)}</CodeBlock>
            ) : (
              <code
                className="bg-sidebar border text-sidebar-foreground px-1 py-0.5 rounded text-sm"
                {...props}
              >
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-6 mb-2">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-6 mb-2">{children}</ol>;
          },
          li({ children }) {
            return <li className="mb-1">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-xl font-bold mb-2 mt-4">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-md font-bold mb-2 mt-3">{children}</h3>;
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

export function MessageContent({ message }: { message: Message }) {
  const blocks = useMemo(
    () => parseMarkdownIntoBlocks(message.content),
    [message.content]
  );

  if (message.role === "user") {
    return (
      <div className="flex flex-col gap-2 items-end w-full">
        {message.experimental_attachments?.map((attachment, index) => {
          if (attachment.contentType?.startsWith("image/")) {
            return (
              <div
                key={`${message.id}-attachment-${index}`}
                className="relative w-full h-64 flex justify-end"
              >
                <img
                  src={attachment.url}
                  alt={attachment.name || ""}
                  className="absolute h-full rounded-lg object-contain"
                />
              </div>
            );
          }

          if (attachment.contentType?.startsWith("application/pdf")) {
            return (
              <div
                key={`${message.id}-attachment-${index}`}
                className="flex items-center justify-center size-48 border rounded-lg"
              >
                <FileText size={24} />
              </div>
            );
          }

          return null;
        })}
        <div
          className="rounded-lg p-4 border whitespace-pre-wrap break-words bg-card text-card-foreground w-fit"
          data-role="user"
          style={{ wordBreak: "break-word" }}
        >
          <p>{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.role === "assistant") {
    return (
      <div className="flex flex-col gap-4">
        {message.parts?.map((part, index) => {
          if (
            part.type === "tool-invocation" &&
            part.toolInvocation.toolName === "memory"
          ) {
            return (
              <div key={`${message.id}-tool-result-${index}`}>
                <p className="text-sm text-muted-foreground">Memory updated</p>
              </div>
            );
          }
          if (part.type === "reasoning") {
            return (
              <Sheet key={`${message.id}-reasoning-${index}`}>
                <SheetTrigger className="text-sm text-muted-foreground mr-auto">
                  Reasoning
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
                      <p className="text-sm text-muted-foreground pt-2 pb-4">
                        {part.reasoning}
                      </p>
                    </ScrollArea>
                    <div className="absolute bottom-6 left-0 right-0 w-full h-6 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
                  </div>
                </SheetContent>
              </Sheet>
            );
          }
        })}
        <div className="flex flex-col gap-1">
          <div>
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
          {message.parts?.some((part) => part.type === "source") && (
            <div className="flex gap-2">
              {message.parts
                ?.filter((part) => part.type === "source")
                .map((part, index) => (
                  <a
                    key={`source-${part.source.id}`}
                    href={part.source.url}
                    target="_blank"
                    className="hover:text-accent"
                  >
                    [{index + 1}]
                  </a>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}
