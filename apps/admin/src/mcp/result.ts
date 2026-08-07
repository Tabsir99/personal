import type { CallToolResult } from "@modelcontextprotocol/server";
import type { ApiResponse } from "@/lib/appUtils";

export function text(body: string): CallToolResult {
  return { content: [{ type: "text", text: body }] };
}

export function unwrap<T>(response: ApiResponse<T>): T {
  if (response.status === "error") throw new Error(response.message);
  return response.data;
}

export async function guarded(
  run: () => Promise<string>,
): Promise<CallToolResult> {
  try {
    return text(await run());
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: error instanceof Error ? error.message : String(error),
        },
      ],
      isError: true,
    };
  }
}

const CELL_MAX_LENGTH = 120;

function cell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const rendered =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  const collapsed = rendered.replace(/\s+/g, " ").replace(/\|/g, "\\|");
  return collapsed.length > CELL_MAX_LENGTH
    ? `${collapsed.slice(0, CELL_MAX_LENGTH)}…`
    : collapsed;
}

export function table(rows: Record<string, unknown>[], limit = 50): string {
  if (rows.length === 0) return "No rows.";

  const shown = rows.slice(0, limit);
  const columns = [...new Set(shown.flatMap((row) => Object.keys(row)))];

  const lines = [
    `| ${columns.join(" | ")} |`,
    `| ${columns.map(() => "---").join(" | ")} |`,
    ...shown.map(
      (row) => `| ${columns.map((column) => cell(row[column])).join(" | ")} |`,
    ),
  ];

  if (rows.length > shown.length) {
    lines.push("", `${rows.length - shown.length} more rows not shown.`);
  }

  return lines.join("\n");
}

export function money(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function percent(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`;
}

export function delta(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? "0%" : "new";
  const change = (current - previous) / previous;
  return `${change >= 0 ? "+" : ""}${(change * 100).toFixed(1)}%`;
}
