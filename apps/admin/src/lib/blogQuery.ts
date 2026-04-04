import { Collections } from "@/lib/constants";
import { firestore } from "firebase-admin";
import { db } from "@/config/firebaseAdmin";

export const deleteBlogdb = async ({
  blogId,
  isDraft,
}: {
  blogId: string;
  isDraft?: boolean;
}) => {
  try {
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
  } catch (error) {
    throw error;
  }
};
