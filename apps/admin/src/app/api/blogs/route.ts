import { env, fetcher } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const blogId = request.nextUrl.searchParams.get("blogId");
  if (!blogId) return NextResponse.json({}, { status: 400 });

  const res = await fetcher({
    url: `${env.BLOGSITE_HOSTNAME}/api/blogs?blogId=${encodeURIComponent(blogId)}`,
    method: "GET",
  });

  if (!res.ok) {
    return NextResponse.json({}, { status: 404, statusText: "Blog not found" });
  }

  return res;
}
