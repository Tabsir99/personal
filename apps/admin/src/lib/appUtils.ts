import { DocContent, docToText } from "@open-notion/editor";

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

export const measureEstReadTime = async (blogContent: DocContent) => {
  const textsLength = (await docToText(blogContent))
    .trim()
    .split(/\s+/)
    .filter((word) => {
      const isLessThanTwoCharacters = word.length < 3;
      return !isLessThanTwoCharacters;
    }).length;

  const estReadTime = Math.ceil(textsLength / 230);

  return estReadTime;
};

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

type ActionResult<T> = {
  data: T;
  message?: string;
};

export function wrap<Args extends any[], T>(
  fn: (...args: Args) => Promise<ActionResult<T>>,
) {
  return async (...args: Args): Promise<ApiResponse<T>> => {
    try {
      const { data, message } = await fn(...args);

      return formatResponse<T>({
        status: "success",
        data,
        message,
      });
    } catch (error) {
      console.error(error);

      return formatResponse<T>({
        status: "error",
        data: null,
        message: error.message,
      });
    }
  };
}
