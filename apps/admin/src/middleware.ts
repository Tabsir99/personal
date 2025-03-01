import { NextRequest, NextResponse } from "next/server";
import { authLimiter } from "./config/redisConfig";

// Constants
const ALLOWED_METHODS = ["POST", "GET", "OPTIONS"] as const;
const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  TOO_MANY_REQUESTS: 429,
} as const;

// Types
type AllowedMethod = (typeof ALLOWED_METHODS)[number];

// Helper functions
const isValidMethod = (method: string): method is AllowedMethod => {
  return ALLOWED_METHODS.includes(method as AllowedMethod);
};

const handleRateLimit = async (ipAddress: string) => {
  const { success } = await authLimiter.limit(ipAddress);
  return success
    ? NextResponse.next()
    : NextResponse.json({}, { status: HTTP_STATUS.TOO_MANY_REQUESTS });
};

const handleLocalApiAccess = (cookie?: string) => {
  return cookie === process.env.SECRET_COOKIE_VALUE2
    ? NextResponse.next()
    : NextResponse.json(
        { reason: "Unauthenticated", group: "/api/local" },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
};

const handleApiAccess = (accessToken?: string | null) => {
  const isLoggedIn = accessToken === process.env.ACCESS_TOKEN;
  return isLoggedIn
    ? NextResponse.next()
    : NextResponse.json({}, { status: HTTP_STATUS.UNAUTHORIZED });
};

export default async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes("auth")) {
    return NextResponse.next();
  }
  // Method validation
  if (!isValidMethod(request.method)) {
    return NextResponse.json({}, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const ipAddress = request.headers.get("xIp") ?? "unknown";
  const pathname = request.nextUrl.pathname;
  const cookie = request.cookies.get("Authenticated")?.value;

  // Rate limiting for POST requests to root in production
  if (
    pathname === "/" &&
    request.method === "POST" &&
    process.env.NODE_ENV !== "development"
  ) {
    return handleRateLimit(ipAddress);
  }

  // API route handling
  if (pathname !== "/") {
    if (pathname.includes("local") || pathname.includes("dashboard")) {
      return handleLocalApiAccess(cookie);
    }
    return handleApiAccess(request.headers.get("acs_tkn"));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/api/:path*", "/dashboard", "/dashboard/:path*"],
};
