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
