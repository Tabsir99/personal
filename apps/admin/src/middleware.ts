import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const rootUrl = process.env.ADMIN_ORIGIN;

  const pathname = request.nextUrl.pathname;

  if (pathname === "/login/secret") {
    const isLoggedIn =
      request.cookies.get("Authenticated")?.value ===
      process.env.SECRET_COOKIE_VALUE;

    if (!isLoggedIn) {
      return NextResponse.redirect(`${rootUrl}/login`, { status: 307 });
    }
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api")) {
    if (pathname.endsWith("session-end")) {
      // const body = await request.json()
      return NextResponse.next();
    }
    const isLoggedIn =
      request.cookies.get("Authenticated")?.value ===
      process.env.SECRET_COOKIE_VALUE2;

    if (!isLoggedIn) {
      return NextResponse.redirect(`${rootUrl}/login`, { status: 307 });
    }
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

  return response;
}

export const config = {
  matcher: ["/login/:path*", "/api/:path*", "/dashboard/:path*"],
};
