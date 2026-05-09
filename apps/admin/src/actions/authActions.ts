"use server";

import { cookies } from "next/headers";
import { wrap } from "@/lib/appUtils";
import { SignJWT } from "jose";
import { env } from "@/config/env.server";

export const logInAction = wrap(async (formData: FormData) => {
  const username = formData.get("username");
  const password = formData.get("password");

  if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
    throw new Error("Incorrect username or password");
  }

  const cookieStore = await cookies();

  const jwt = await new SignJWT({ role: "owner", id: env.ADMIN_USERNAME })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(env.JWT_SECRET));

  cookieStore.set({
    name: env.COOKIE_NAME,
    value: jwt,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return null;
});

export const logOutAction = wrap(async () => {
  const cookieStore = await cookies();
  cookieStore.delete(env.COOKIE_NAME);
  return null;
});
