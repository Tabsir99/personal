import { firestore } from "firebase-admin";

import { db } from "@/config/firebaseAdminBlog";
import { BlogCategory } from "@/types/blogTypes";
import { Collections } from "@/utils/utils";

export async function addCategorydb(category: BlogCategory) {
  const batch = db.batch();
  try {
    const docRef = db
      .collection(Collections.CATEGORY_METADATA)
      .doc(category.categoryId);
    const dashboardStatsRef = db
      .collection(Collections.STATS.collectionName)
      .doc(Collections.STATS.documents.DASHBOARD);

    batch.create(docRef, category);
    batch.set(
      dashboardStatsRef,
      {
        totalCategory: firestore.FieldValue.increment(1),
      },
      { merge: true }
    );

    await batch.commit();
    return "Category created successfully";
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteCategorydb(categoryId: string) {
  const batch = db.batch();
  try {
    const docRef = db.collection(Collections.CATEGORY_METADATA).doc(categoryId);
    const dashboardStatsRef = db
      .collection(Collections.STATS.collectionName)
      .doc(Collections.STATS.documents.DASHBOARD);

    batch.delete(docRef);
    batch.set(
      dashboardStatsRef,
      {
        totalCategory: firestore.FieldValue.increment(-1),
      },
      { merge: true }
    );

    await batch.commit();

    return "Category Deleted";
  } catch (error) {
    throw error;
  }
}
