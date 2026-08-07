import { createMcpHandler } from "@modelcontextprotocol/server";
import { buildAdminMcpServer } from "@/mcp/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const handler = createMcpHandler(() => buildAdminMcpServer(), {
  onerror: (error) => console.error("[mcp]", error),
});

export function POST(request: Request): Promise<Response> {
  return handler.fetch(request);
}

export function GET(request: Request): Promise<Response> {
  return handler.fetch(request);
}

export function DELETE(request: Request): Promise<Response> {
  return handler.fetch(request);
}
