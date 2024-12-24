import { Collections, env, fetcher } from "@/utils/utils";
import { firestore } from "firebase-admin";

import { db } from "@/config/firebaseAdminBlog";
import { Blog } from "@/types/blogTypes";
import { formatResponse } from "@/utils/utils";

export const uploadBlogdb = async (blog: Blog) => {
  try {
    const batch = db.batch();

    const blogDocRef = db.collection(Collections.BLOGS).doc(blog.link);

    batch.set(blogDocRef, blog, { merge: true });

    const blogDocument = await blogDocRef.get();

    if (!blogDocument.exists) {
      const categoryMetadataDocRef = db
        .collection(Collections.CATEGORY_METADATA)
        .doc(blog.categoryId);
      const validLinksRef = db.collection(Collections.VALID_LINKS).doc("links");
      const dashBoardRef = db
        .collection(Collections.STATS.collectionName)
        .doc(Collections.STATS.documents.DASHBOARD);
      const sitemapLinksRef = db
        .collection(Collections.VALID_LINKS)
        .doc("sitemap-links");

      batch.set(
        categoryMetadataDocRef,
        {
          updatedAt: blog.blogMetadata.createdAt,
          totalPosts: firestore.FieldValue.increment(1),
        },
        { merge: true }
      );
      batch.set(
        validLinksRef,
        {
          blogLinks: firestore.FieldValue.arrayUnion(blog.link),
        },
        { merge: true }
      );

      batch.set(
        dashBoardRef,
        {
          totalPosts: firestore.FieldValue.increment(1),
          updatedAt: blog.blogMetadata.updatedAt,
        },
        { merge: true }
      );
      batch.set(
        sitemapLinksRef,
        {
          blogLinks: firestore.FieldValue.arrayUnion({
            link: `/blogs/${blog.link}`,
            updatedAt: new Date().toISOString(),
          }),
        },
        {
          merge: true,
        }
      );
    }
    await batch.commit();

    return formatResponse("success", "Blog Uploaded Successfully!");
  } catch (error) {
    return formatResponse("error", "Blog Uploaded Successfully!");
  }
};

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
