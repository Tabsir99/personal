import { z } from "zod";
import { db, Collections } from "@/config/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

const CONFIG_COLLECTION = db.collection(Collections.CONFIG);
const TAGS_CONFIG_DOC_NAME = "blog";

const tagsConfigSchema = z.object({
  tags: z.array(z.string()).default([]),
});

const createTagBodySchema = z.object({
  tag: z
    .string()
    .trim()
    .min(1, "Tag cannot be empty")
    .transform((v) => v.toLowerCase()),
});

async function readTags() {
  const snap = await CONFIG_COLLECTION.doc(TAGS_CONFIG_DOC_NAME).get();
  return tagsConfigSchema.parse(snap.data() ?? {}).tags;
}

export async function GET() {
  try {
    return NextResponse.json(await readTags());
  } catch (error) {
    console.error("API Error (tags):", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = createTagBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid tag" },
        { status: 400 },
      );
    }
    const { tag: normalizedTag } = parsed.data;

    const existingTags = await readTags();
    const tagSet = new Set(existingTags.map((t) => t.toLowerCase()));
    tagSet.add(normalizedTag);
    const tags = Array.from(tagSet).sort();

    await CONFIG_COLLECTION.doc(TAGS_CONFIG_DOC_NAME).set({ tags }, { merge: true });

    return NextResponse.json({ tag: normalizedTag, tags });
  } catch (error) {
    console.error("API Error (create tag):", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 },
    );
  }
}
