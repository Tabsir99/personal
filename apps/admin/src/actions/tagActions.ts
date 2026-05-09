"use server";
import { z } from "zod";
import { db, Collections } from "@/config/firebaseAdmin";
import { wrap } from "@/lib/appUtils";

const CONFIG_COLLECTION = db.collection(Collections.CONFIG);
const TAGS_CONFIG_DOC_NAME = "blog";

const tagsConfigSchema = z.object({
  tags: z.array(z.string()).default([]),
});

const createTagBodySchema = z
  .string()
  .trim()
  .min(1, "Tag cannot be empty")
  .transform((v) => v.toLowerCase());

export async function readTags() {
  const snap = await CONFIG_COLLECTION.doc(TAGS_CONFIG_DOC_NAME).get();
  return tagsConfigSchema.parse(snap.data() ?? {}).tags;
}

export const addTag = wrap(async (tag: string) => {
  const normalizedTag = createTagBodySchema.parse(tag);

  const existingTags = await readTags();
  const tagSet = new Set(existingTags.map((t) => t.toLowerCase()));
  tagSet.add(normalizedTag);
  const tags = Array.from(tagSet).sort();

  await CONFIG_COLLECTION.doc(TAGS_CONFIG_DOC_NAME).set(
    { tags },
    { merge: true },
  );

  return { tag: normalizedTag, tags };
});
