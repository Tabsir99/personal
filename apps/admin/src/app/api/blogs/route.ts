import { readNDocs } from "@/lib/commonQuery";
import { Blog } from "@/types/blogTypes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const status = query.get("status") as Blog["status"] | undefined;

  const data = await readNDocs<Blog>({
    collectionName: "BLOGS",
    cursorValue: query.get("cursor"),
    filters: status ? { status } : {},
    fieldsToRead: {
      blogId: true,
      blogDescription: true,
      blogName: true,
      blogStats: true,
      createdAt: true,
      estReadTime: true,
      link: true,
      status: true,
    },
    orderBy: {
      field: "createdAt",
      order: "desc",
    },
  });

  return NextResponse.json(data);
}
