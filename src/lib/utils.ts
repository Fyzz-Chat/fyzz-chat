import type { Message } from "ai";
import { type ClassValue, clsx } from "clsx";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FormState = {
  message: string;
  description: string;
};

export const initialState: FormState = {
  message: "",
  description: "",
};

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

export function formatTimeAgo(date: Date) {
  return timeAgo.format(date);
}

export function debounce(func: Function, wait = 100) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function ensure(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function filterMessagesUpToAnchor(
  old: Message[],
  messageId: string,
  newContent?: string
): Message[] {
  const anchorMessage = old.find((m: Message) => m.id === messageId);
  if (!anchorMessage) {
    return old;
  }
  const anchorMessageDate = new Date(anchorMessage.createdAt as Date);
  const isUserMessage = anchorMessage.role === "user";

  // Keep messages older than the anchor message and the anchor itself if it's a user message
  return old
    .filter((m: Message) => {
      const messageDate = new Date(m.createdAt as Date);
      const isBefore = messageDate < anchorMessageDate;
      const isAnchorAndUserMessage = isUserMessage && m.id === messageId;
      return isBefore || isAnchorAndUserMessage;
    })
    .map((m: Message) => {
      if (m.id === messageId) {
        return {
          ...m,
          content: newContent ?? m.content,
          parts: newContent
            ? [
                {
                  type: "text",
                  text: newContent,
                },
              ]
            : m.parts,
        };
      }
      return m;
    });
}
