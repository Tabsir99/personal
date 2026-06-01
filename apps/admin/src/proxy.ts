import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { env } from "./config/env.server";

const isLoggedIn = async (token?: string) => {
  try {
    if (!token) return false;
    await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const isApiRequest = (pathname: string) => pathname.startsWith("/api/");
const isActionRequest = (request: NextRequest) =>
  request.headers.get("next-action") != null;

// serverToken (portfolio → admin) may only reach public, portfolio-facing
// reads — never the analytics dashboard, content writes, or the upload
// presigner, which all require a real admin login.
const serverTokenAllowed = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/api/blogs") || // list, featured, [slug], score
    pathname.startsWith("/api/config") || // blog config (tags / kinds)
    pathname === "/api/site-config" ||
    pathname === "/api/event" // analytics ingest
  ) {
    return true;
  }
  // page-data is publicly readable, but only writable behind a login.
  return pathname === "/api/page-data" && request.method === "GET";
};

const unauthorizedResponse = (request: NextRequest) => {
  if (
    isApiRequest(request.nextUrl.pathname) ||
    isActionRequest(request)
  ) {
    return NextResponse.json(
      { status: "error", message: "Unauthorized" },
      { status: 401 },
    );
  }
  return NextResponse.redirect(process.env.NEXT_PUBLIC_ADMIN_ORIGIN as string);
};

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(env.COOKIE_NAME)?.value;
  const serverToken = request.headers.get("serverToken");

  // serverToken (portfolio → admin) bypasses login only for the public,
  // portfolio-facing endpoints — never dashboard data, writes, or uploads.
  if (serverToken === env.SERVER_TOKEN && serverTokenAllowed(request)) {
    return NextResponse.next();
  }

  const userAuthenticated = await isLoggedIn(token);

  // Login page: redirect already-authenticated users to dashboard.
  if (pathname === "/") {
    return userAuthenticated
      ? NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_ADMIN_ORIGIN}/dashboard`,
        )
      : NextResponse.next();
  }

  if (!userAuthenticated) return unauthorizedResponse(request);
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/api/:path*", "/dashboard/:path*"],
};
