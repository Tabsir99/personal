"use server";

import { cookies } from "next/headers";

import { formatResponse } from "@/utils/utils";
import { redirect } from "next/navigation";

export async function logInAction(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return formatResponse("error", "Incorrect username or password");
  }

  const cookieStore = await cookies();

  const cookieValue = process.env.SECRET_COOKIE_VALUE;
  cookieStore.set({
    name: "Authenticated",
    value: cookieValue as string,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return formatResponse("success", "Successfully signed in");
}

export async function secretAction(secret: string) {
  const cookieStore = await cookies();

  if (secret !== process.env.ADMIN_SECRET_CODE) {
    cookieStore.delete("Authenticated");
    redirect("/");
  }

  const cookieValue = process.env.SECRET_COOKIE_VALUE2;

  cookieStore.set({
    name: "Authenticated",
    value: cookieValue as string,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return formatResponse("success", "Log in Successfull");
}
