import { NextRequest, NextResponse } from "next/server";
import { authLimiter } from "./config/redisConfig";

const allowedMethods = ["POST", "GET", "OPTIONS"];
export default async function middleware(request: NextRequest) {
  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json({}, { status: 400 });
  }

  const ipAdd = request.headers.get("xIp") || "unknown";
  const pathname = request.nextUrl.pathname;

  if (pathname === "/" && request.method === "POST") {
    const { success } = await authLimiter.limit(ipAdd);
    return success
      ? NextResponse.next()
      : NextResponse.json({}, { status: 429 });
  }

  if (pathname.startsWith("/api")) {
    const isLoggedIn =
      request.headers.get("acs_tkn") === process.env.ACCESS_TOKEN;

    console.log("IsAuthenticated:", isLoggedIn);
    if (!isLoggedIn) {
      return NextResponse.json({}, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/api/:path*"],
};
