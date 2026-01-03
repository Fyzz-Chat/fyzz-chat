"use client";

import type { ToolUIPart } from "ai";
import { Check, Copy } from "lucide-react";
import { marked } from "marked";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/source";
import {
  OpenAICodeInterpreterOutput,
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import ImageFilePart from "@/components/message/parts/image-file-part";
import PdfFilePart from "@/components/message/parts/pdf-file-part";
import TextPart from "@/components/message/parts/text-part";
// xonokai, tomorrow, twilight, prism
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useChatStore } from "@/stores/chat-store";
import type { CustomUIMessage } from "@/types/chat";
import { pdfType } from "@/types/provider";
import type { CodeInterpreterOutput, ImageGenerationOutput } from "@/types/tools";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "./ai-elements/reasoning";

// import { Response } from "@/components/ai-elements/response";

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

const MemoizedSyntaxHighlighter = memo(
  ({ language, children, ...props }: { language: string; children: string }) => {
    return (
      <SyntaxHighlighter
        style={tomorrow}
        language={language}
        PreTag="div"
        className="rounded-md border bg-sidebar/90! p-4 text-sm!"
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
      <div className="group/code relative my-2 overflow-x-auto" ref={codeRef}>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 z-10 size-8 transition-opacity duration-100 ${
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
            <div className="absolute top-3 right-12 z-20 rounded-md border bg-background px-2 py-1 text-foreground text-xs shadow-md">
              Copied!
            </div>
          )}
        </div>
        {isRendered && isStable ? (
          <MemoizedSyntaxHighlighter language={language}>
            {children.replace(/\n$/, "")}
          </MemoizedSyntaxHighlighter>
        ) : (
          <div className="overflow-auto rounded-md border bg-sidebar/90 p-4 text-sidebar-foreground text-sm!">
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
                  className="rounded border bg-sidebar px-1 py-0.5 text-sidebar-foreground"
                  style={{ fontSize: "14px !important" }}
                  {...props}
                >
                  {children}
                </code>
              </span>
            );
          },
          p({ children }) {
            return <p className="mb-2 leading-6 last:mb-0">{children}</p>;
          },
          ul({ children }) {
            return <ul className="mb-2 list-disc space-y-2 pl-6">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="mb-4 list-decimal space-y-2 pl-6">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-7">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="mt-6 mb-2 font-bold text-xl">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="mt-6 mb-2 font-bold text-lg">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="mt-6 mb-2 font-bold text-md">{children}</h3>;
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
      className="wrap-break-word"
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
      <div className="flex w-full flex-col items-end gap-2">
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

            if (part.mediaType?.startsWith(pdfType)) {
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
      <div className="flex min-h-6 flex-col gap-4">
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
                    <ToolOutput output={""} errorText={part.errorText} />
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
            case "tool-code_interpreter": {
              return (
                <Tool key={`${message.id}-tool-code_interpreter-${index}`}>
                  <ToolHeader type="tool-code_interpreter" state={part.state} />
                  <ToolContent>
                    <ToolInput input={part.input} />
                    <OpenAICodeInterpreterOutput
                      output={part.output as CodeInterpreterOutput}
                      errorText={part.errorText}
                    />
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
            case "tool-image_generation": {
              const output = part.output as ImageGenerationOutput;
              return (
                <Tool open key={`${message.id}-tool-image_generation-${index}`}>
                  <ToolHeader type="tool-image_generation" state={part.state} />
                  <ToolContent>
                    <ImageFilePart url={`data:image/png;base64,${output?.result}`} />
                  </ToolContent>
                </Tool>
              );
            }
            case "reasoning": {
              return (
                (status === "streaming" || part.text) && (
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
                )
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
            default: {
              return null;
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
                default:
                  return null;
              }
            })}
          </Sources>
        )}
      </div>
    );
  }
}
