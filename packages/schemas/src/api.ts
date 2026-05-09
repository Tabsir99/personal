export type ApiResponse<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string };

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}
