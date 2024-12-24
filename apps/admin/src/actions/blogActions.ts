"use server";
import { deleteBlogdb, toggleBlogStatusdb } from "@/lib/blogQuery";
import { createData, readSingleDoc } from "@/lib/commonQuery";
import { Blog } from "@/types/blogTypes";
import { buildAdminBlog, env, fetcher, formatResponse } from "@/utils/utils";
import { Collections } from "@/utils/utils";
import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

export async function saveDraft(draftBlog: Blog) {
  const docId = encodeURIComponent(
    draftBlog.blogName.toLowerCase().replace(/\s/g, "-")
  );
  draftBlog.link = docId;
  draftBlog.blogMetadata.createdAt = Timestamp.now();
  draftBlog.blogMetadata.updatedAt = Timestamp.now();

  try {
    await createData({
      collectionName: Collections.BLOGS,
      docId,
      data: draftBlog,
    });
    revalidatePath("/dashboard", "layout");
    return formatResponse("success", "Draft saved succesfully");
  } catch (error) {
    return formatResponse("error", "There was a error saving the draft");
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

    await Promise.all([uploadBlogPromise, fetchPromise]);
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
}: {
  blogId: string;
  categoryId: string;
}) {
  try {
    const deleteBlogPromise = deleteBlogdb({ blogId, categoryId });
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
    return formatResponse("error", "server error occured");
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

export async function getBlog(docId: string) {
  try {
    const res = await readSingleDoc<Blog>({
      collectionName: Collections.BLOGS,
      docId,
    });
    return formatResponse("success", res, "Data received successfully");
  } catch (error) {
    return formatResponse("error", null, "Error while reading data");
  }
}
