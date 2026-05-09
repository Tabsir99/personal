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

  // serverToken (portfolio → admin read access) only bypasses /api/*.
  // It must NOT grant access to dashboard pages or server actions.
  if (serverToken === env.SERVER_TOKEN && isApiRequest(pathname)) {
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
