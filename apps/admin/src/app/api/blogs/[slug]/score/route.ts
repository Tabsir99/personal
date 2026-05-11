import { z } from "zod";
import { NextRequest } from "next/server";
import { db, Collections } from "@/config/firebaseAdmin";
import { BlogStatus, PublishedBlogDB } from "@tabsircg/schemas/blog";
import { wrapRoute } from "@/lib/appUtils";

const slugSchema = z.string().min(1);
const deltaSchema = z.object({
  delta: z.number().int().positive().max(50),
});

async function getPublishedDocRefBySlug(slug: string) {
  const snapshot = await db
    .collection(Collections.BLOGS)
    .where("slug", "==", slug)
    .where("status", "==", BlogStatus.published)
    .limit(1)
    .get();
  if (snapshot.empty) throw new Error("Not found");
  return snapshot.docs[0].ref;
}

export const GET = wrapRoute(
  async (_req, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const parsedSlug = slugSchema.parse(slug);
    const ref = await getPublishedDocRefBySlug(parsedSlug);
    const snap = await ref.get();
    const data = snap.data() as PublishedBlogDB | undefined;
    return { score: data?.stats?.score ?? 0 };
  },
);

export const POST = wrapRoute(
  async (req: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const parsedSlug = slugSchema.parse(slug);
    const { delta } = deltaSchema.parse(await req.json());

    const ref = await getPublishedDocRefBySlug(parsedSlug);

    // TODO: rate limit
    // Read + write inside the same txn so concurrent taps serialize and the
    // returned value matches what was actually persisted.
    const newScore = await db.runTransaction(async (tx) => {
      const fresh = await tx.get(ref);
      if (!fresh.exists) throw new Error("Not found");
      const current =
        (fresh.data() as PublishedBlogDB | undefined)?.stats?.score ?? 0;
      const next = current + delta;
      tx.update(ref, { "stats.score": next });
      return next;
    });

    return { score: newScore };
  },
);
