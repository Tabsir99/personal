import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { JSONContent } from "@tiptap/react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

type ResponseStatus = "success" | "error" | "fail";

export interface ApiResponse<T> {
  status: ResponseStatus;
  data: T | null;
  message: string;
}

export const formatResponse = <T>({
  status = "success" as ResponseStatus,
  data,
  message = "",
}): ApiResponse<T> => {
  return {
    status,
    data,
    message,
  };
};

export const measureEstReadTime = (json: JSONContent) => {
  const blogText = extractTextFromTipTapJSON(json);
  const textsLength = blogText
    .trim()
    .split(/\s+/)
    .filter((word) => {
      const isLessThanTwoCharacters = word.length < 3;
      return !isLessThanTwoCharacters;
    }).length;

  const estReadTime = Math.ceil(textsLength / 230);

  return estReadTime;
};

function extractTextFromTipTapJSON(json: JSONContent) {
  let text = "";

  if (!json || !json.content) {
    return text;
  }

  json.content.forEach((node) => {
    if (node.text) {
      text += node.text;
    }

    if (node.type === "text" && node.marks) {
      node.marks.forEach((mark) => {
        if (mark.text) {
          text += mark.text;
        }
      });
    }

    if (node.content) {
      text += extractTextFromTipTapJSON(node);
    }
  });

  return text;
}

export const getTimeSince = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days ago`;
  if (interval === 1) return "yesterday";

  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} hours ago`;
  if (interval === 1) return "1 hour ago";

  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutes ago`;

  return "just now";
};

export function debounce(func: (content: any) => void, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

export function throttle(func: (...args: any[]) => void, limit: number) {
  let inThrottle: boolean;
  return function (...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

import { toast } from "sonner";
export async function callWithToast(
  func: () => Promise<any>,
  {
    loading = "Loading...",
    success = "Success",
    err = "Error",
  }: {
    loading?: string;
    success?: string;
    err?: string;
  }
) {
  const id = toast.loading(loading);
  try {
    await func();
    toast.success(success, { id });
  } catch (error) {
    toast.error(err, { id });
  }
}
