import { readSingleDoc } from "@/lib/commonQuery";
import { Blog } from "@/types/blogTypes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params: { blogId } }: { params: { blogId: string } }
) {
  console.log(blogId);
  if (!blogId) return NextResponse.json({}, { status: 400 });

  const blog = await readSingleDoc<Blog>({
    collectionName: "BLOGS",
    docId: blogId,
  });

  return NextResponse.json(blog);
}
