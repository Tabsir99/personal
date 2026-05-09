import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const isErrorResponse = (
  v: unknown,
): v is { status: "error"; message: string } =>
  !!v &&
  typeof v === "object" &&
  "status" in v &&
  (v as { status: unknown }).status === "error";

export async function callWithToast<T>(
  func: () => Promise<T>,
  {
    loading = "Loading...",
    success = "Success",
    err = "Error",
  }: {
    loading?: string;
    success?: string;
    err?: string;
  },
): Promise<T | undefined> {
  const id = toast.loading(loading);
  try {
    const result = await func();
    if (isErrorResponse(result)) {
      toast.error(result.message || err, { id });
    } else {
      toast.success(success, { id });
    }
    return result;
  } catch (error) {
    toast.error(err, {
      id,
      ...("message" in error ? { description: error.message } : {}),
    });
    return undefined;
  }
}
