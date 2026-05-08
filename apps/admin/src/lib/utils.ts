import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  },
) {
  const id = toast.loading(loading);
  try {
    const result = await func();
    // `wrap`-ed actions resolve with an ApiResponse rather than throwing.
    if (
      result &&
      typeof result === "object" &&
      "status" in result &&
      result.status !== "success"
    ) {
      toast.error(result.message || err, { id });
      return null;
    }
    toast.success(success, { id });
    return result;
  } catch (error) {
    toast.error(err, { id });
    return null;
  }
}
