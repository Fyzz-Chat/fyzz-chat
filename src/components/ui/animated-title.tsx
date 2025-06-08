import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface AnimatedTitleProps {
  text: string;
  className?: string;
  delay?: number;
}

export function AnimatedTitle({ text, className, delay = 50 }: AnimatedTitleProps) {
  const [displayedText, setDisplayedText] = useState(text);
  const [currentIndex, setCurrentIndex] = useState(0);
  const previousTextRef = useRef(text);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    // Only animate if:
    // 1. The text has changed
    // 2. The previous text was "New Chat" (or empty)
    // 3. We haven't animated this title before
    if (
      text !== previousTextRef.current &&
      (previousTextRef.current === "New Chat" || previousTextRef.current === "") &&
      !hasAnimatedRef.current
    ) {
      setDisplayedText("");
      setCurrentIndex(0);
      hasAnimatedRef.current = true;
    } else {
      setDisplayedText(text);
      setCurrentIndex(text.length);
    }
    previousTextRef.current = text;
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, delay]);

  return (
    <span className={cn("inline-block whitespace-nowrap truncate", className)}>
      {displayedText}
      {currentIndex < text.length && <span className="animate-pulse">▋</span>}
    </span>
  );
}
