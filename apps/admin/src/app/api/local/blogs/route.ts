import { readSingleDoc } from "@/lib/commonQuery";
import { Blog, BlogStatus } from "@/types/blogTypes";
import { Collections, env, fetcher } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const blogId = request.nextUrl.searchParams.get("blogId");
  const status = request.nextUrl.searchParams.get("status") as BlogStatus;
  if (!blogId) return NextResponse.json({}, { status: 400 });

  if (status === BlogStatus.Draft) {
    const res = await readSingleDoc<Blog>({
      collectionName: Collections.DRAFTS,
      docId: blogId,
    });
    if (!res)
      return NextResponse.json(
        {},
        { status: 404, statusText: "Blog not found" }
      );

    return NextResponse.json(res);
  }

  const res = await fetcher({
    url: `${env.BLOGSITE_HOSTNAME}/api/blogs?blogId=${encodeURIComponent(blogId)}`,
    method: "GET",
  });

  if (!res.ok) {
    return NextResponse.json({}, { status: 404, statusText: "Blog not found" });
  }

  return res;
}
