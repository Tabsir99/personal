import { firestore } from "firebase-admin";
import { db, Collections } from "@/config/firebaseAdmin";
import { BlogStatus } from "@tabsircg/schemas/blog";

export interface BlogNeighbour {
  slug: string;
  title: string;
}

// prev = next-older post, next = next-newer, by publishedAt (two indexed reads).
export async function fetchPublishedNeighbours(
  publishedAt: number,
): Promise<{ prev: BlogNeighbour | null; next: BlogNeighbour | null }> {
  const published = db
    .collection(Collections.BLOGS)
    .where("status", "==", BlogStatus.published);
  const [olderSnap, newerSnap] = await Promise.all([
    published
      .where("publishedAt", "<", publishedAt)
      .orderBy("publishedAt", "desc")
      .limit(1)
      .get(),
    published
      .where("publishedAt", ">", publishedAt)
      .orderBy("publishedAt", "asc")
      .limit(1)
      .get(),
  ]);
  const toNeighbour = (
    snap: FirebaseFirestore.QuerySnapshot,
  ): BlogNeighbour | null =>
    snap.empty
      ? null
      : { slug: snap.docs[0].get("slug"), title: snap.docs[0].get("title") };
  return { prev: toNeighbour(olderSnap), next: toNeighbour(newerSnap) };
}

export const deleteBlogdb = async ({
  blogId,
  isDraft,
}: {
  blogId: string;
  isDraft?: boolean;
}) => {
  const batch = db.batch();

  const docRef = db.collection(Collections.BLOGS).doc(blogId);
  batch.delete(docRef);

  if (!isDraft) {
    const dashboardRef = db
      .collection(Collections.DASHBOARD_STATS)
      .doc("dashboard");

    batch.set(
      dashboardRef,
      {
        updatedAt: Date.now(),
        totalPosts: firestore.FieldValue.increment(-1),
      },
      { merge: true },
    );
  }

  await batch.commit();
};

interface ReadSingleBlogParams<T> {
  docId: string;
  fieldsToRead?: Partial<Record<keyof T, boolean>>;
}

export const readSingleBlog = async <T>({
  docId,
  fieldsToRead,
}: ReadSingleBlogParams<T>): Promise<T | null> => {
  const docRef = db.collection(Collections.BLOGS).doc(docId);

  // Project at the database level with a field mask so large fields (e.g. the
  // serialized blog `content`) aren't read off the wire when only a few small
  // fields are needed.
  if (fieldsToRead) {
    const fields = Object.entries(fieldsToRead)
      .filter(([, include]) => include)
      .map(([field]) => field);
    if (fields.length > 0) {
      const [snapshot] = await db.getAll(docRef, { fieldMask: fields });
      return snapshot.exists ? (snapshot.data() as T) : null;
    }
  }

  const snapshot = await docRef.get();
  return snapshot.exists ? (snapshot.data() as T) : null;
};
