import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { slug?: string; delta?: number }
    | null;

  const delta = typeof body?.delta === "number" ? body.delta : 0;
  if (!body?.slug || delta <= 0) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  return NextResponse.json({ global: delta });
}
