"use client";

// xonokai, tomorrow, twilight, prism
import { Button } from "@/components/ui/button";

import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/source";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import ImageFilePart from "@/components/message/parts/image-file-part";
import PdfFilePart from "@/components/message/parts/pdf-file-part";
import TextPart from "@/components/message/parts/text-part";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useChatStore } from "@/stores/chat-store";
import type { CustomUIMessage } from "@/types/chat";
import type { ToolUIPart } from "ai";
import { Check, Copy, Download } from "lucide-react";
import { marked } from "marked";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "./ai-elements/reasoning";
// import { Response } from "@/components/ai-elements/response";

type GenerateImageToolInput = {
  prompt: string;
};

type GenerateImageToolOutput = {
  image: string;
  url: string;
  name: string;
  contentType: string;
};

type GenerateImageToolUIPart = ToolUIPart<{
  generateImage: {
    input: GenerateImageToolInput;
    output: GenerateImageToolOutput;
  };
}>;

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

const MemoizedMarkdown = memo(({ content, id }: { content: string; id: string }) => {
  const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

  return blocks.map((block, index) => (
    <div
      key={`${id}-block-${index}`}
      className="break-words"
      style={{ wordBreak: "break-word" }}
    >
      <MemoizedMarkdownBlock content={block} />
    </div>
  ));
});

export function MessageContent({ message }: { message: CustomUIMessage }) {
  const status = useChatStore((state) => state.status);

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
                  mediaType={part.mediaType}
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
    let reasoningIndex = 0;
    return (
      <div className="flex flex-col gap-4 min-h-6">
        {message.parts?.map((part, index) => {
          switch (part.type) {
            case "text": {
              return (
                <div key={`${message.id}-text-${index}`}>
                  {/* <Response key={`${message.id}-text-new-${index}`}>{part.text}</Response> */}
                  <MemoizedMarkdown content={part.text} id={message.id} />
                </div>
              );
            }
            case "tool-memory": {
              return (
                <Tool key={`${message.id}-tool-memory-${index}`}>
                  <ToolHeader type="tool-memory" state={part.state} />
                  <ToolContent>
                    <ToolInput input={part.input} />
                  </ToolContent>
                </Tool>
              );
            }
            case "tool-readUrl": {
              return (
                <Tool key={`${message.id}-tool-readUrl-${index}`}>
                  <ToolHeader type="tool-readUrl" state={part.state} />
                  <ToolContent>
                    <ToolInput input={part.input} />
                    <ToolOutput output={""} errorText={part.errorText} />
                  </ToolContent>
                </Tool>
              );
            }
            case "tool-readYoutube": {
              return (
                <Tool key={`${message.id}-tool-readYoutube-${index}`}>
                  <ToolHeader type="tool-readYoutube" state={part.state} />
                  <ToolContent>
                    <ToolInput input={part.input} />
                    <ToolOutput output={""} errorText={part.errorText} />
                  </ToolContent>
                </Tool>
              );
            }
            case "dynamic-tool": {
              return (
                <Tool key={`${message.id}-${part.toolName}-${index}`}>
                  <ToolHeader
                    type={part.toolName as ToolUIPart["type"]}
                    state={part.state}
                  />
                  <ToolContent>
                    <ToolInput input={part.input} />
                  </ToolContent>
                </Tool>
              );
            }
            case "tool-generateImage": {
              const imageTool = part as GenerateImageToolUIPart;
              return (
                <Tool defaultOpen key={`${message.id}-tool-generateImage-${index}`}>
                  <ToolHeader type="tool-generateImage" state={part.state} />
                  <ToolContent>
                    <ToolInput input={imageTool.input} />
                    <ToolOutput
                      output={
                        <ImageFilePart
                          key={`${message.id}-file-${index}`}
                          url={imageTool.output?.image || ""}
                          name={imageTool.output?.name}
                          mediaType={imageTool.output?.contentType}
                        />
                      }
                      errorText={imageTool.errorText}
                    />
                  </ToolContent>
                </Tool>
              );
            }
            case "reasoning": {
              return (
                <Reasoning
                  key={`${message.id}-reasoning-${index}`}
                  isStreaming={status === "streaming"}
                >
                  <ReasoningTrigger
                    duration={
                      message.metadata?.reasoningDurations?.[reasoningIndex++]?.ms
                    }
                  />
                  <ReasoningContent>{part.text}</ReasoningContent>
                </Reasoning>
              );
            }
            case "file": {
              return (
                <ImageFilePart
                  key={`${message.id}-file-${index}`}
                  url={part.url}
                  name={part.filename}
                  mediaType={part.mediaType}
                />
              );
            }
          }
        })}
        {message.parts?.some((part) => part.type === "source-url") && (
          <Sources defaultOpen>
            <SourcesTrigger
              count={
                message.parts?.filter((part) => part.type === "source-url").length || 0
              }
            />
            {message.parts.map((part, i) => {
              switch (part.type) {
                case "source-url":
                  return (
                    <SourcesContent key={`${message.id}-${i}`}>
                      <Source
                        key={`${message.id}-${i}`}
                        href={part.url}
                        title={part.url}
                      />
                    </SourcesContent>
                  );
              }
            })}
          </Sources>
        )}
      </div>
    );
  }
}
