import { firestore } from "firebase-admin";
import { db, Collections } from "@/config/firebaseAdmin";

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
  const snapshot = await docRef.get();

  if (!snapshot.exists) return null;

  const data = snapshot.data() as Record<string, unknown>;

  if (!fieldsToRead) return data as T;

  const projected: Record<string, unknown> = {};
  for (const [field, include] of Object.entries(fieldsToRead)) {
    if (include) projected[field] = data[field];
  }
  return projected as T;
};
