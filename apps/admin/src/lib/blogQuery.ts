import { Collections, env, fetcher } from "@/utils/utils";
import { firestore } from "firebase-admin";

import { db } from "@/config/firebaseAdminBlog";
import { formatResponse } from "@/utils/utils";


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
    return formatResponse("success", "Blog has been deleted successfully");
  } catch (error) {
    return formatResponse("error", "A server error occured");
  }
};

export const toggleBlogStatusdb = async (blogId: string) => {
  try {
    const docRef = db.collection(Collections.BLOG_METADATA).doc(blogId);
    const blogDoc = await docRef.get();

    if (!blogDoc.exists) {
      return formatResponse("error", "Blog not found");
    }

    const isActive = blogDoc.data()?.status === "active";
    const newStatus = isActive ? "inactive" : "active";

    const batch = db.batch();

    batch.set(
      docRef,
      {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    const fetchPromise = fetcher({
      url: `${env.BLOGSITE_HOSTNAME}/api/blogs`,
      body: JSON.stringify({ type: "status", status: newStatus, blogId }),
      method: "PUT",
    });

    await Promise.all([batch.commit(), fetchPromise]);

    return formatResponse(
      "success",
      null,
      isActive ? "Blog deactivated successfully" : "Blog activated successfully"
    );
  } catch (error) {
    console.error("Error while updating blog status:", error);
    return formatResponse("error", null, "Error while updating");
  }
};
