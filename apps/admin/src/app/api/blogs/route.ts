import { readNDocs } from "@/lib/commonQuery";
import { PublishedBlogDB } from "@/types/blogTypes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
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
        dek: true,
        seoTitle: true,
        tags: true,
        coverImageUrl: true,
        readTime: true,
        metaDescription: true,
        stats: true,
        createdAt: true,
        updatedAt: true,
        slug: true,
        status: true,
        type: true,
      },
      orderBy: {
        field: "createdAt",
        order: "desc",
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 },
    );
  }
}
