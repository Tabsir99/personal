import { env } from "@/config/env";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization");
  if (token !== env.SERVER_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }

  revalidatePath("/");
  console.info("Revalidated");
  return NextResponse.json({ message: "Revalidated" });
}
