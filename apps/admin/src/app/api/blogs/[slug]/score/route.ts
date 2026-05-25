import { z } from "zod";
import { NextRequest } from "next/server";
import { db, Collections } from "@/config/firebaseAdmin";
import { BlogStatus, PublishedBlogDB } from "@tabsircg/schemas/blog";
import { wrapRoute } from "@/lib/appUtils";

const MAX_FELT = 50;
const slugSchema = z.string().min(1);
const bodySchema = z.object({
  id: z.string().min(1).max(100),
  count: z.number().int().positive().max(MAX_FELT),
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
  async (req: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const parsedSlug = slugSchema.parse(slug);
    const id = req.nextUrl.searchParams.get("id") ?? "";

    const ref = await getPublishedDocRefBySlug(parsedSlug);
    const snap = await ref.get();
    const score = (snap.data() as PublishedBlogDB | undefined)?.stats?.score ?? 0;

    let mine = 0;
    if (id) {
      const deviceSnap = await ref.collection("felt").doc(id).get();
      mine = (deviceSnap.data()?.count as number | undefined) ?? 0;
    }
    return { score, mine };
  },
);

export const POST = wrapRoute(
  async (req: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const parsedSlug = slugSchema.parse(slug);
    const { id, count } = bodySchema.parse(await req.json());

    const ref = await getPublishedDocRefBySlug(parsedSlug);
    const deviceRef = ref.collection("felt").doc(id);

    return db.runTransaction(async (tx) => {
      const [blogSnap, deviceSnap] = await Promise.all([
        tx.get(ref),
        tx.get(deviceRef),
      ]);
      if (!blogSnap.exists) throw new Error("Not found");

      const score = (blogSnap.data() as PublishedBlogDB).stats?.score ?? 0;
      const stored = (deviceSnap.data()?.count as number | undefined) ?? 0;
      const nextMine = Math.min(MAX_FELT, Math.max(stored, count));
      const added = nextMine - stored;
      if (added > 0) {
        tx.set(deviceRef, { count: nextMine });
        tx.update(ref, { "stats.score": score + added });
      }
      return { mine: nextMine };
    });
  },
);
