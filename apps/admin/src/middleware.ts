import { NextRequest, NextResponse } from "next/server";

const allowedMethods = ["POST", "GET"];
export default async function middleware(request: NextRequest) {
  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json({}, { status: 400 });
  }
  
  const rootUrl = process.env.ADMIN_ORIGIN;

  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api")) {
    if (pathname.endsWith("session-end")) {
      // const body = await request.json()
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

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

  return response;
}

export const config = {
  matcher: ["/", "/api/:path*", "/dashboard/:path*"],
};
