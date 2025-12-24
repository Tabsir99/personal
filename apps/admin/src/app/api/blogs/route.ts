import { readNDocs } from "@/lib/commonQuery";
import { PublishedBlogDB } from "@/types/blogTypes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;

  const status = query.get("status") as PublishedBlogDB["status"] | null;
  const type = query.get("type") as PublishedBlogDB["type"] | null;
  const cursor = query.get("cursor");

  const filters: Partial<Pick<PublishedBlogDB, "status" | "type">> = {};

  if (status) filters.status = status;
  if (type) filters.type = type;

  const data = await readNDocs<PublishedBlogDB>({
    collectionName: "BLOGS",
    cursorValue: cursor,
    filters,
    fieldsToRead: {
      blogId: true,
      title: true,
      description: true,
      tags: true,
      estReadTime: true,
      stats: true,
      createdAt: true,
      updatedAt: true,
      link: true,
      status: true,
      featuredImageUrl: true,
      type: true,
    },
    orderBy: {
      field: "createdAt",
      order: "desc",
    },
  });

  return NextResponse.json(data);
}
