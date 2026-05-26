import { env } from "@/config/env";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

type RevalidateBody = {
  path?: string | string[];
  paths?: string[];
  tag?: string | string[];
  tags?: string[];
};

const toArray = (v?: string | string[]): string[] =>
  v == null ? [] : Array.isArray(v) ? v : [v];

export async function POST(request: NextRequest) {
  const token = request.headers.get("acs_tkn");
  if (token !== env.SERVER_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: RevalidateBody = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const paths = [...toArray(body.path), ...toArray(body.paths)];
  const tags = [...toArray(body.tag), ...toArray(body.tags)];

  if (paths.length === 0 && tags.length === 0) {
    return NextResponse.json(
      { message: "Provide a path or tag to revalidate" },
      { status: 400 },
    );
  }

  for (const path of paths) revalidatePath(path);
  // { expire: 0 } purges immediately rather than serving stale.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  return NextResponse.json({ message: "Revalidated", paths, tags });
}
