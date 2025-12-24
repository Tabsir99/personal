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

export default async function middleware(request: NextRequest) {
  try {
    // const ipAddress = request.headers.get("xIp") ?? "unknown";
    const pathname = request.nextUrl.pathname;
    const token = request.cookies.get("token")?.value;
    const serverToken = request.headers.get("serverToken");
    const serverAuthenticated = serverToken === env.SERVER_TOKEN;

    if (
      env.RUNTIME === "local" &&
      request.method === "POST" &&
      pathname.startsWith("/dashboard")
    ) {
      await new Promise((res) => setTimeout(res, 500));
    }

    // Server auth bypasses everything
    if (serverAuthenticated) return NextResponse.next();

    const userAuthenticated = await isLoggedIn(token);
    if (pathname !== "/" && !userAuthenticated) throw new Error("Unauthorized");

    // Redirect to dashboard if user is authenticated
    if (pathname === "/" && userAuthenticated)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_ADMIN_ORIGIN}/dashboard`
      );

    // Return next if everything is authenticated
    return NextResponse.next();
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(
      process.env.NEXT_PUBLIC_ADMIN_ORIGIN as string
    );
  }
}
export const config = {
  matcher: ["/", "/api/:path*", "/dashboard/:path*"],
};
