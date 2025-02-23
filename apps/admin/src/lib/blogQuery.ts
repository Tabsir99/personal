import { Collections } from "@/utils/utils";
import { firestore } from "firebase-admin";

import { db } from "@/config/firebaseAdminBlog";

export const deleteBlogdb = async ({
  blogId,
  categoryId,
}: {
  blogId: string;
  categoryId: string;
}) => {
  try {
    const batch = db.batch();

    const docRef = db.collection(Collections.BLOG_METADATA).doc(blogId);

    const categoryMetadataDocRef = db
      .collection(Collections.CATEGORY_METADATA)
      .doc(categoryId);
    const dashboardRef = db
      .collection(Collections.STATS.collectionName)
      .doc(Collections.STATS.documents.DASHBOARD);

    batch.delete(docRef);
    batch.set(
      categoryMetadataDocRef,
      {
        updatedAt: new Date().toISOString(),
        totalPosts: firestore.FieldValue.increment(-1),
      },
      { merge: true }
    );

    batch.set(
      dashboardRef,
      {
        updatedAt: new Date().toISOString(),
        totalPosts: firestore.FieldValue.increment(-1),
      },
      { merge: true }
    );

    await batch.commit();
  } catch (error) {
    throw error;
  }
};
