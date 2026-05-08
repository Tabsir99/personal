import { z } from "zod";
import { db, Collections } from "@/config/firebaseAdmin";
import { BlogStatus, PublishedBlogDB } from "@/schemas/blogSchemas";
import { NextRequest, NextResponse } from "next/server";

const slugSchema = z.string().min(1);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const parsedSlug = slugSchema.safeParse(slug);
    if (!parsedSlug.success) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const snapshot = await db
      .collection(Collections.BLOGS)
      .where("slug", "==", parsedSlug.data)
      .where("status", "==", BlogStatus.published)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = snapshot.docs[0].data() as PublishedBlogDB;
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error (blog by slug):", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 },
    );
  }
}
