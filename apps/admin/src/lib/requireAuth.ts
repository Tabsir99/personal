import "server-only";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { env } from "@/config/env.server";

export async function requireAuth(): Promise<void> {
  const token = (await cookies()).get(env.COOKIE_NAME)?.value;
  if (!token) throw new Error("Unauthorized");
  try {
    await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET));
  } catch {
    throw new Error("Unauthorized");
  }
}
