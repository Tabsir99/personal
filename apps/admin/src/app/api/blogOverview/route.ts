import { readNDocs } from "@/lib/commonQuery";
import { AdminBlogMetadata } from "@/types/blogTypes";
import { Collections } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (
    request.cookies.get("Authenticated")?.value !==
    process.env.SECRET_COOKIE_VALUE2
  ) {
    return NextResponse.json({
      status: 401,
      message: "Unauthenticated",
    });
  }

  const query = request.nextUrl.searchParams;
  let filter: { filterBy: string[]; filterValues: string[] } = {
    filterBy: [],
    filterValues: [],
  };
  const categoryId = query.get("categoryId");
  const status = query.get("status");

  if (categoryId) {
    filter.filterBy.push("categoryId");
    filter.filterValues.push(categoryId);
  }
  if (status) {
    filter.filterBy.push("status");
    filter.filterValues.push(status);
  }

  const data: AdminBlogMetadata[] = await readNDocs({
    collectionName: Collections.BLOG_METADATA,
    limitNumber: 30,
    filter: filter,
    cursorValue: query.get("cursor"),
  });
  return NextResponse.json(data);
}
