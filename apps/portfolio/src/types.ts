export type ApiResponse<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string };

const toMessage = (e: unknown) => (e instanceof Error ? e.message : String(e));

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
