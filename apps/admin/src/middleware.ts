import { NextRequest, NextResponse } from "next/server";
import { authLimiter } from "./config/redisConfig";
import { jwtVerify } from "jose";
import { env } from "./config/env";

const ALLOWED_METHODS = ["POST", "GET"] as const;
const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  TOO_MANY_REQUESTS: 429,
} as const;

type AllowedMethod = (typeof ALLOWED_METHODS)[number];

const isValidMethod = (method: string): method is AllowedMethod => {
  return ALLOWED_METHODS.includes(method as AllowedMethod);
};

const isLoggedIn = async (token?: string) => {
  try {
    if (!token) return false;
    await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET));
    return true;
  } catch (error) {
    return false;
  }
};

const handleRateLimit = async (ipAddress: string) => {
  const { success } = await authLimiter.limit(ipAddress);
  return success
    ? NextResponse.next()
    : NextResponse.json({}, { status: HTTP_STATUS.TOO_MANY_REQUESTS });
};

export default async function middleware(request: NextRequest) {
  try {
    if (request.nextUrl.pathname.includes("auth")) {
      return NextResponse.next();
    }
    if (!isValidMethod(request.method)) {
      throw new Error("");
    }

    const ipAddress = request.headers.get("xIp") ?? "unknown";
    const pathname = request.nextUrl.pathname;
    const token = request.cookies.get("token")?.value;

    if (
      pathname === "/" &&
      request.method === "POST" &&
      process.env.NODE_ENV !== "development"
    ) {
      return handleRateLimit(ipAddress);
    }

    const authenticated = await isLoggedIn(token);
    if (pathname !== "/" && !authenticated) {
      throw new Error("");
    }

    if (pathname === "/" && authenticated) {
      return NextResponse.redirect(`${env.ADMIN_ORIGIN}/dashboard`);
    }

    return NextResponse.next();
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}

export const config = {
  matcher: ["/", "/api/:path*", "/dashboard", "/dashboard/:path*"],
};
