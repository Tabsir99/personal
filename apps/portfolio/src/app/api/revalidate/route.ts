import { env } from "@/config/env";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = request.headers.get("acs_tkn");
  if (token !== env.SERVER_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { path?: string; tag?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!body.path && !body.tag) {
    return NextResponse.json(
      { message: "Provide a path or tag to revalidate" },
      { status: 400 },
    );
  }

  if (body.path) revalidatePath(body.path);
  if (body.tag) revalidateTag(body.tag, { expire: 0 });

  return NextResponse.json({ message: "Revalidated" });
}
