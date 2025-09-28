import { readNDocs } from "@/lib/commonQuery";
import { PublishedBlogEditingDB } from "@/types/blogTypes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const status = query.get("status") as
    | PublishedBlogEditingDB["status"]
    | undefined;

  const data = await readNDocs<PublishedBlogEditingDB>({
    collectionName: "BLOGS",
    cursorValue: query.get("cursor"),
    filters: status ? { status } : {},
    fieldsToRead: {
      blogId: true,

      description: true,
      draftDescription: true,

      draftTitle: true,
      title: true,

      draftTags: true,
      tags: true,

      estReadTime: true,
      draftEstReadTime: true,

      stats: true,
      createdAt: true,
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
