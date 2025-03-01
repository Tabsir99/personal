// pages/api/auth/linkedin/callback.ts or app/api/auth/linkedin/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { decode, JwtPayload } from "jsonwebtoken";
import { createData, readSingleDoc } from "@/lib/commonQuery";
import { Collections } from "@/utils/utils";
import { User } from "@/types/types";
import { decrypt, encrypt } from "@/utils/encryption";

export async function GET(req: NextRequest) {
  // Get the URL parameters
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Get the state we stored when initiating the flow
  const storedState = req.cookies.get("linkedin_oauth_state")?.value;

  // Validate state to prevent CSRF
  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/settings`
    );
  }
  const encryptionKey = process.env.ENCRYPTION_KEY!;

  try {
    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code);
    console.log(tokenResponse);
    const decodedIdtoken = decode(tokenResponse.id_token) as JwtPayload;
    console.log(decodedIdtoken);

    const encryptedAccessToken = encrypt(
      tokenResponse.access_token,
      encryptionKey
    );

    // Calculate the correct expiration time (convert `expires_in` from seconds to a timestamp)
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + tokenResponse.expires_in);

    const userExists = await readSingleDoc<
      User & { accessToken: string; expiresIn: number }
    >({
      collectionName: Collections.USERS,
      docId: decodedIdtoken.email,
    });

    if (!userExists) {
      await createData({
        collectionName: Collections.USERS,
        docId: decodedIdtoken.email,
        data: {
          role: "admin",
          accessToken: encryptedAccessToken,
          expiryDate,
          username: decodedIdtoken?.name,
          email: decodedIdtoken?.email,
        },
      });
    }
    console.log(decrypt(encryptedAccessToken, encryptionKey));
    // Set the token as a cookie
    const response = NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/settings`
    );

    return response;
  } catch (error) {
    console.error("LinkedIn OAuth error:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/settings`
    );
  }
}

async function exchangeCodeForToken(code: string) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/linkedin`,
    client_id: process.env.LINKEDIN_CLINET_ID!,
    client_secret: process.env.LINKEDIN_CLINET_SECRET!,
  });

  const response = await fetch(
    "https://www.linkedin.com/oauth/v2/accessToken",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`LinkedIn token error: ${errorData}`);
  }

  return response.json() as Promise<{
    access_token: string;
    expires_in: number;
    scope: "eamil,openid,profile";
    token_type: "Bearer";
    id_token: string;
  }>;
}
