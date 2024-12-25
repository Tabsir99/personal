import { updateData } from "@/lib/commonQuery";
import { Collections } from "@/utils/utils";
import { firestore } from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { blogId, willLike } = (await request.json()) as {
    blogId: string;
    willLike: string;
  };

  try {
    await updateData(Collections.BLOG_METADATA, blogId, {
      "pageMetrics.blogMetrics.totalLikes": firestore.FieldValue.increment(
        willLike ? 1 : -1
      ),
    });
  } catch (error) {}

  return NextResponse.json({});
}
