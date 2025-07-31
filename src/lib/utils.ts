import { standaloneTrpc } from "@/lib/trpc/client";
import type { Attachment, Message } from "ai";
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
  success?: boolean;
};

export const initialState: FormState = {
  message: "",
  description: "",
  success: undefined,
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

export function isFileList(value: any): value is FileList {
  return (
    value &&
    typeof value === "object" &&
    typeof value.length === "number" &&
    typeof value.item === "function"
  );
}

export async function uploadFiles(
  conversationId: string,
  fileList?: Attachment[] | FileList
): Promise<Attachment[]> {
  if (!fileList) {
    return [];
  }

  if (!isFileList(fileList)) {
    return fileList;
  }

  const uploadResults = await standaloneTrpc.getUploadUrls.query({
    conversationId,
    count: fileList.length,
  });

  const uploads = await Promise.all(
    Array.from(fileList).map(async (file, index) => {
      console.debug(`Uploading file ${index + 1} of ${fileList.length}...`);

      const { key, url } = uploadResults[index];

      if (!url) {
        const base64 = await fileToBase64(file);
        return fileToAttachment(file, base64);
      }

      const response = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      console.debug(`File ${index + 1} of ${fileList.length} uploaded successfully.`);

      return fileToAttachment(file, key);
    })
  );

  return uploads;
}

export function fileToAttachment(file: File, key: string): Attachment {
  return {
    name: file.name,
    contentType: file.type,
    url: key,
  };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
