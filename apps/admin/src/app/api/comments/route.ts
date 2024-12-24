import { updateData } from "@/lib/commonQuery";
import { Collections } from "@/utils/utils";
import { firestore } from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { blogId } = (await request.json()) as {
    blogId: string;
  };
  try {
    await updateData(Collections.BLOG_METADATA, blogId, {
      "pageMetrics.blogMetrics.totalComments":
        firestore.FieldValue.increment(1),
    });
  } catch (error) {}

  return NextResponse.json({});
}
