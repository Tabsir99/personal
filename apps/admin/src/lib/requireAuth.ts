import "server-only";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { env } from "@/config/env.server";

export async function requireAuth(): Promise<void> {
  if (process.env.BYPASS_AUTH === "1" && process.env.NODE_ENV === "development")
    return;

  const token = (await cookies()).get(env.COOKIE_NAME)?.value;
  if (!token) throw new Error("Unauthorized");
  try {
    await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET));
  } catch {
    throw new Error("Unauthorized");
  }
}
