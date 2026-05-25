import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@tabsircg/schemas/api";
import { env } from "@/config/env";

type Mine = { mine: number };

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const id = request.cookies.get("felt-id")?.value;
  if (!slug) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  try {
    const qs = id ? `?id=${encodeURIComponent(id)}` : "";
    const res = await fetch(
      `${env.ADMIN_ORIGIN}/api/blogs/${encodeURIComponent(slug)}/score${qs}`,
      { headers: { serverToken: env.SERVER_TOKEN } },
    );
    const json = (await res.json()) as ApiResponse<{ score: number } & Mine>;
    if (json.status === "error") {
      return NextResponse.json({ error: json.message }, { status: 502 });
    }
    return NextResponse.json({ mine: json.data.mine });
  } catch (err) {
    console.error("score fetch failed:", err);
    return NextResponse.json({ error: "upstream failed" }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    slug?: string;
    count?: number;
  } | null;
  const id = request.cookies.get("felt-id")?.value;
  const count = typeof body?.count === "number" ? body.count : 0;

  if (!body?.slug || !id || count <= 0) {
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
        body: JSON.stringify({ id, count }),
      },
    );
    const json = (await res.json()) as ApiResponse<Mine>;
    if (json.status === "error") {
      return NextResponse.json({ error: json.message }, { status: 502 });
    }
    return NextResponse.json({ mine: json.data.mine });
  } catch (err) {
    console.error("score proxy failed:", err);
    return NextResponse.json({ error: "upstream failed" }, { status: 502 });
  }
}
