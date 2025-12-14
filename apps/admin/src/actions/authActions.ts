"use server";

import { cookies } from "next/headers";
import { formatResponse } from "@/lib/utils";
import { SignJWT } from "jose";
import { env } from "@/config/env.server";

export async function logInAction(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
    return formatResponse({
      status: "error",
      message: "Incorrect username or password",
      data: null,
    });
  }

  const cookieStore = await cookies();

  const jwt = await new SignJWT({ role: "owner", id: env.ADMIN_USERNAME })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(env.JWT_SECRET));

  cookieStore.set({
    name: "token",
    value: jwt,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });

  return formatResponse({
    status: "success",
    message: "Successfully signed in",
    data: null,
  });
}
