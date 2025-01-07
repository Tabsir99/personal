import { NextRequest, NextResponse } from "next/server";
import { authLimiter, sessionLimiter } from "./config/redisConfig";

const allowedMethods = ["POST", "GET", "OPTIONS"];
export default async function middleware(request: NextRequest) {
  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json({}, { status: 400 });
  }

  const rootUrl = process.env.ADMIN_ORIGIN;
  const ipAdd = request.headers.get("CF-Connecting-IP") || "unknown";
  const pathname = request.nextUrl.pathname;

  if (pathname === "/" && request.method === "POST") {
    const { success } = await authLimiter.limit(ipAdd);
    return success
      ? NextResponse.next()
      : NextResponse.json({}, { status: 429 });
  }

  if (pathname.startsWith("/api")) {
    if (pathname.endsWith("session-end")) {
      const { success } = await sessionLimiter.limit(ipAdd);
      if (!success) {
        return NextResponse.json({}, { status: 429 });
      }
      
      return NextResponse.next();
    }

    if (pathname.endsWith("likes") || pathname.endsWith("comments")) {
      const isLoggedIn =
        request.headers.get("acs_tkn") === process.env.ACCESS_TOKEN;

      if (!isLoggedIn) {
        return NextResponse.json({}, { status: 401 });
      }
      return NextResponse.next();
    }

    const isLoggedIn =
      request.cookies.get("Authenticated")?.value ===
      process.env.SECRET_COOKIE_VALUE2;

    if (!isLoggedIn) {
      const response = NextResponse.redirect(rootUrl as string, {
        status: 307,
      });
      response.cookies.delete("Authenticated");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/api/:path*"],
};
