// pages/api/auth/linkedin/login.ts or app/api/auth/linkedin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET(_: NextRequest) {
  // Generate state parameter to prevent CSRF attacks
  const state = randomBytes(16).toString("hex");

  // Store the state in a cookie or session for validation during callback
  const response = NextResponse.redirect(getLinkedInAuthURL(state));
  response.cookies.set("linkedin_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}

function getLinkedInAuthURL(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLINET_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/linkedin`,
    state: state,
    scope: "openid profile email",
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}
