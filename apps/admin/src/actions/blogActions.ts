"use server";
import { db } from "@/config/firebaseAdminBlog";
import { deleteBlogdb } from "@/lib/blogQuery";
import { createData, deleteData, readSingleDoc } from "@/lib/commonQuery";
import { AdminBlogListItem, Blog, BlogFormData } from "@/types/blogTypes";
import {
  ApiResponse,
  buildAdminBlog,
  buildBlog,
  env,
  fetcher,
  formatResponse,
} from "@/utils/utils";
import { Collections } from "@/utils/utils";
import { revalidatePath } from "next/cache";

export async function saveDraft(
  blogFormData: BlogFormData
): Promise<ApiResponse<Blog>> {
  const draftExists = await readSingleDoc<Blog>({
    collectionName: Collections.BLOG_METADATA,
    docId: blogFormData.blogId,
    fieldsToRead: ["blogId"],
  });

  const draftBlog = buildBlog(blogFormData, true, draftExists?.blogId);
  const adminBlogListItem = buildAdminBlog(draftBlog, !!draftExists);

  try {
    await Promise.all([
      createData({
        collectionName: Collections.BLOG_METADATA,
        docId: draftBlog.blogId,
        data: adminBlogListItem,
      }),
      createData({
        collectionName: Collections.DRAFTS,
        docId: draftBlog.blogId,
        data: draftBlog,
      }),
    ]);
    revalidatePath("/dashboard", "layout");
    return formatResponse({
      status: "success",
      data: draftBlog,
      message: "Draft saved succesfully",
    });
  } catch (error) {
    console.log(error);
    return formatResponse({
      status: "error",
      data: null,
      message: "There was a error saving the draft",
    });
  }
}

export async function uploadBlog(
  blogFormData: BlogFormData
): Promise<ApiResponse<AdminBlogListItem>> {
  const blog = buildBlog(blogFormData, false, blogFormData.blogId);

  const blogDoc = await readSingleDoc<AdminBlogListItem>({
    collectionName: Collections.BLOG_METADATA,
    docId: blog.blogId,
    fieldsToRead: ["status", "link"],
  });

  if (!blogDoc)
    throw new Error(
      "Blog metadata does not exists. System error as it must exist before uploading"
    );

  const adminBlogListItem = buildAdminBlog(blog, true);

  try {
    const uploadBlogPromise = createData({
      collectionName: Collections.BLOG_METADATA,
      docId: blog.blogId,
      data: adminBlogListItem,
    });

    const fetchPromise = fetcher({
      url: `${env.BLOGSITE_HOSTNAME}/api/blogs`,
      body: JSON.stringify(blog),
    });
    const deleteDraftPromise = deleteData({
      collectionName: Collections.DRAFTS,
      docId: blog.blogId,
    });

    await Promise.all([uploadBlogPromise, fetchPromise, deleteDraftPromise]);
    revalidatePath("/", "layout");
    return formatResponse({
      status: "success",
      data: adminBlogListItem,
      message: "Blog uploaded successfully",
    });
  } catch (error) {
    console.error(error);
    return formatResponse({
      status: "error",
      data: null,
      message: "Error occured while uploading",
    });
  }
}

export async function deleteBlog({
  blogId,
  categoryId,
}: {
  blogId: string;
  categoryId: string;
}) {
  try {
    const blogStatus = await readSingleDoc<AdminBlogListItem>({
      docId: blogId,
      collectionName: Collections.BLOG_METADATA,
      fieldsToRead: ["status"],
    });

    if (!blogStatus) {
      throw new Error("Blog not found, so not deleted");
    }

    const deleteBlogPromise = deleteBlogdb({ blogId, categoryId });

    if (blogStatus.status === "draft") {
      await Promise.all([
        deleteBlogPromise,
        deleteData({ collectionName: Collections.DRAFTS, docId: blogId }),
      ]);

      revalidatePath("/dashboard", "layout");
      return formatResponse({
        status: "success",
        data: null,
        message: "Draft deleted successfully",
      });
    }
    const fetchPromise = fetcher({
      url: `${env.BLOGSITE_HOSTNAME}/api/blogs`,
      body: JSON.stringify({ blogId }),
      method: "DELETE",
    });

    await Promise.all([deleteBlogPromise, fetchPromise]);
    revalidatePath("/", "layout");
    return formatResponse({
      status: "success",
      data: null,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return formatResponse({
      status: "error",
      data: null,
      message: "server error occured",
    });
  }
}

export async function toggleBlogStatus(
  blogId: string
): Promise<ApiResponse<null>> {
  try {
    const docRef = db.collection(Collections.BLOG_METADATA).doc(blogId);
    const blogDoc = await docRef.get();

    if (!blogDoc.exists) {
      return { message: "Blog does not exists!", data: null, status: "fail" };
    }

    const isActive = blogDoc.data()!.status === "active";
    const newStatus = isActive ? "inactive" : "active";

    const localPromise = docRef.set(
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

    await Promise.all([localPromise, fetchPromise]);

    return {
      data: null,
      message: isActive
        ? "Blog deactivated successfully"
        : "Blog activated successfully",
      status: "success",
    };
  } catch (error) {
    console.error("Error while updating blog status:", error);
    return {
      data: null,
      status: "error",
      message: "Error occured during updating blog status",
    };
  }
}
