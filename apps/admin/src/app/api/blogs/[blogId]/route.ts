import { dbToBlogFormData } from "@/lib/blogUtils";
import { readSingleDoc } from "@/lib/commonQuery";
import { BlogDB } from "@/types/blogTypes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  const { blogId } = await params;

  const blog = await readSingleDoc<BlogDB>({
    collectionName: "BLOGS",
    docId: blogId,
  });

  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  return NextResponse.json(dbToBlogFormData(blog));
}
