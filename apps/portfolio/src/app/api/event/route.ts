import { NextRequest, NextResponse } from "next/server";
import { analyticsEventSchema } from "@tabsircg/schemas/dashboard";
import { env } from "@/config/env";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = analyticsEventSchema.safeParse(body);
  if (!parsed.success) {
    return new NextResponse(null, { status: 400 });
  }

  const xCountry =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    "unknown";
  const xIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  await fetch(`${env.ADMIN_ORIGIN}/api/event`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      serverToken: env.SERVER_TOKEN,
      "user-agent": userAgent,
      xCountry,
      xIp,
    },
    body: JSON.stringify(parsed.data),
  }).catch(() => {});

  return new NextResponse(null, { status: 204 });
}
