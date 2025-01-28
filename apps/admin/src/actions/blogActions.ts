"use server";
import { deleteBlogdb, toggleBlogStatusdb } from "@/lib/blogQuery";
import { createData, deleteData } from "@/lib/commonQuery";
import { AdminBlogMetadata, Blog } from "@/types/blogTypes";
import { buildAdminBlog, env, fetcher, formatResponse } from "@/utils/utils";
import { Collections } from "@/utils/utils";
import { revalidatePath } from "next/cache";

export async function saveDraft(
  draftBlog: Blog,
  adminBlog: Partial<AdminBlogMetadata>
) {
  const docId = encodeURIComponent(
    draftBlog.blogName.toLowerCase().replace(/\s/g, "-")
  );
  draftBlog.link = docId;
  draftBlog.blogMetadata.createdAt = new Date().toISOString();
  draftBlog.blogMetadata.updatedAt = new Date().toISOString();
  draftBlog.status = "draft";

  adminBlog.link = docId;
  adminBlog.createdAt = new Date().toISOString();
  adminBlog.status = "draft";

  try {
    await Promise.all([
      createData({
        collectionName: Collections.BLOG_METADATA,
        docId,
        data: adminBlog,
      }),
      createData({
        collectionName: Collections.DRAFTS,
        docId,
        data: draftBlog,
      }),
    ]);
    revalidatePath("/dashboard", "layout");
    return formatResponse("success", null, "Draft saved succesfully");
  } catch (error) {
    return formatResponse("error", null, "There was a error saving the draft");
  }
}

export async function uploadBlog(blog: Blog) {
  const shouldUpdate = blog.blogMetadata.createdAt ? true : false;
  const docId =
    blog.link ||
    encodeURIComponent(blog.blogName.toLowerCase().replace(/\s/g, "-"));

  if (!blog.link) {
    blog.link = docId;
  }

  if (!blog.blogMetadata.createdAt) {
    blog.blogMetadata.createdAt = new Date().toISOString();
  }
  blog.blogMetadata.updatedAt = new Date().toISOString();

  const adminBlogMetadata = buildAdminBlog(blog, shouldUpdate);

  try {
    const uploadBlogPromise = createData({
      collectionName: Collections.BLOG_METADATA,
      docId: blog.link,
      data: adminBlogMetadata,
    });
    const fetchPromise = fetcher({
      url: `${env.BLOGSITE_HOSTNAME}/api/blogs`,
      body: JSON.stringify({ blog, shouldUpdate }),
    });
    const deleteDraftPromise = deleteData({
      collectionName: Collections.DRAFTS,
      docId,
    });

    await Promise.all([uploadBlogPromise, fetchPromise, deleteDraftPromise]);
    revalidatePath("/", "layout");
    return formatResponse(
      "success",
      adminBlogMetadata,
      "Blog uploaded successfully"
    );
  } catch (error) {
    console.error(error);
    return formatResponse("error", null, "Error occured while uploading");
  }
}

export async function deleteBlog({
  blogId,
  categoryId,
  isDraft,
}: {
  blogId: string;
  categoryId: string;
  isDraft: boolean;
}) {
  try {
    const deleteBlogPromise = deleteBlogdb({ blogId, categoryId });

    if (isDraft) {
      await Promise.all([
        deleteBlogPromise,
        deleteData({ collectionName: Collections.DRAFTS, docId: blogId }),
      ]);

      revalidatePath("/dashboard", "layout");
      return formatResponse("success", null, "Draft deleted successfully");
    }
    const fetchPromise = fetcher({
      url: `${env.BLOGSITE_HOSTNAME}/api/blogs`,
      body: JSON.stringify({ blogId }),
      method: "DELETE",
    });

    const [deleteBLog, _] = await Promise.all([
      deleteBlogPromise,
      fetchPromise,
    ]);
    revalidatePath("/", "layout");
    return deleteBLog;
  } catch (error) {
    console.error(error);
    return formatResponse("error", null, "server error occured");
  }
}

export async function toggleBlogStatus(blogId: string) {
  try {
    const res = await toggleBlogStatusdb(blogId);

    revalidatePath("/", "layout");
    return res;
  } catch (error) {
    return formatResponse("error", "server error occured");
  }
}
