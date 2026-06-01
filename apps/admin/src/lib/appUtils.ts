import { DocContent, docToText } from "@open-notion/editor";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiResponse } from "@tabsircg/schemas/api";

export type { ApiResponse };

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

const toMessage = (e: unknown) =>
  e instanceof Error ? e.message : String(e);

// Throw from a route handler to return a specific HTTP status (e.g. 404)
// instead of a generic 500. The message is sent to the client verbatim, so
// keep it safe/intentional.
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function wrap<Args extends any[], T>(
  fn: (...args: Args) => Promise<T>,
): (...args: Args) => Promise<ApiResponse<T>> {
  return async (...args: Args) => {
    try {
      return { status: "success", data: await fn(...args) };
    } catch (error) {
      console.error(error);
      return { status: "error", message: toMessage(error) };
    }
  };
}

export function wrapRoute<T>(
  handler: (req: NextRequest, ctx: any) => Promise<T>,
): (req: NextRequest, ctx: any) => Promise<NextResponse<ApiResponse<T>>> {
  return async (req, ctx) => {
    try {
      const data = await handler(req, ctx);
      return NextResponse.json<ApiResponse<T>>(
        { status: "success", data },
        { status: 200 },
      );
    } catch (error) {
      console.error(error);
      if (error instanceof ZodError) {
        return NextResponse.json<ApiResponse<T>>(
          {
            status: "error",
            message: error.issues[0]?.message ?? "Invalid input",
          },
          { status: 400 },
        );
      }
      if (error instanceof HttpError) {
        return NextResponse.json<ApiResponse<T>>(
          { status: "error", message: error.message },
          { status: error.status },
        );
      }
      // Don't leak internal error text (Firestore index URLs, stack details).
      return NextResponse.json<ApiResponse<T>>(
        { status: "error", message: "Internal server error" },
        { status: 500 },
      );
    }
  };
}

export const measureEstReadTime = async (blogContent: DocContent) => {
  const textsLength = (await docToText(blogContent))
    .trim()
    .split(/\s+/)
    .filter((word) => word.length >= 3).length;

  return Math.ceil(textsLength / 230);
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
