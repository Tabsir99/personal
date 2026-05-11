import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@tabsircg/schemas/api";
import { env } from "@/config/env";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { slug?: string; delta?: number }
    | null;

  const delta = typeof body?.delta === "number" ? body.delta : 0;
  if (!body?.slug || delta <= 0) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${env.ADMIN_ORIGIN}/api/blogs/${encodeURIComponent(body.slug)}/score`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          serverToken: env.SERVER_TOKEN,
        },
        body: JSON.stringify({ delta }),
      },
    );
    const json = (await res.json()) as ApiResponse<{ score: number }>;
    if (json.status === "error") {
      return NextResponse.json({ error: json.message }, { status: 502 });
    }
    return NextResponse.json(json.data);
  } catch (err) {
    console.error("score proxy failed:", err);
    return NextResponse.json({ error: "upstream failed" }, { status: 502 });
  }
}
