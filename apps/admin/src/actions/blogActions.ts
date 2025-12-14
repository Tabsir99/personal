"use server";
import { deleteBlogdb } from "@/lib/blogQuery";
import { createData, readSingleDoc, updateData } from "@/lib/commonQuery";
import { BlogFormData, BlogStatus, BlogDB } from "@/types/blogTypes";
import { ApiResponse, formatResponse, measureEstReadTime } from "@/lib/utils";
import {
  blogFormDataToDB,
  createNewBlogFormData,
  dbToBlogFormData,
  draftToPublishedBlog,
  sendRevalidateRequest,
} from "@/lib/blogUtils";

export async function saveDraft(
  blogFormDataStr: string
): Promise<ApiResponse<BlogDB>> {
  const blogFormData = JSON.parse(blogFormDataStr) as BlogFormData;
  if (!blogFormData.draftContent) {
    throw new Error("Content is required");
  }

  blogFormData.updatedAt = Date.now();
  blogFormData.draftEstReadTime = measureEstReadTime(blogFormData.draftContent);

  const blog = blogFormDataToDB(blogFormData);

  const draftExists = await readSingleDoc<BlogDB>({
    collectionName: "BLOGS",
    docId: blog.blogId,
    fieldsToRead: { blogId: true },
  });

  if (!draftExists) {
    throw new Error("Draft does not exists");
  }

  console.log("blog", blog);
  try {
    await createData<BlogDB>({
      collectionName: "BLOGS",
      docId: blog.blogId,
      data: blog,
    });
    return formatResponse({
      status: "success",
      data: blog,
      message: "Draft saved succesfully",
    });
  } catch (error) {
    console.error(error);
    return formatResponse({
      status: "error",
      data: null,
      message: "There was a error saving the draft",
    });
  }
}

export async function publishBlog(blogId: string): Promise<ApiResponse<null>> {
  // Read the full blog data (not just status and link)
  const blogDoc = await readSingleDoc<BlogDB>({
    collectionName: "BLOGS",
    docId: blogId,
  });

  if (!blogDoc) {
    throw new Error("Blog does not exist");
  }

  try {
    // Convert DB format to form data
    const formData = dbToBlogFormData(blogDoc);

    // Use the utility to promote draft to published
    const publishedFormData = draftToPublishedBlog(formData);

    await updateData<BlogDB>({
      collectionName: "BLOGS",
      docId: blogId,
      updatedData: blogFormDataToDB(publishedFormData, true),
      merge: false,
    });

    sendRevalidateRequest(blogDoc.link);
    return formatResponse({
      status: "success",
      data: null,
      message: "Blog published successfully",
    });
  } catch (error) {
    console.error(error);
    return formatResponse({
      status: "error",
      data: null,
      message: "Error occurred while publishing",
    });
  }
}

export async function deleteBlog(blogId: string) {
  try {
    const blogStatus = await readSingleDoc<BlogDB>({
      docId: blogId,
      collectionName: "BLOGS",
      fieldsToRead: { status: true, link: true },
    });

    if (!blogStatus) {
      throw new Error("Blog not found, so not deleted");
    }

    await deleteBlogdb({
      blogId,
      isDraft: blogStatus.status === "draft",
    });
    sendRevalidateRequest(blogStatus.link);

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
    const blogDoc = await readSingleDoc<BlogDB>({
      collectionName: "BLOGS",
      docId: blogId,
      fieldsToRead: { status: true, link: true },
    });

    if (!blogDoc) {
      return { message: "Blog does not exists!", data: null, status: "fail" };
    }

    if (blogDoc.status === "draft") {
      return {
        message:
          "Draft cannot be activated, Please finish writing and publish the blog first",
        data: null,
        status: "fail",
      };
    }

    const isActive = blogDoc.status === BlogStatus.Active;
    const newStatus = isActive ? BlogStatus.Inactive : BlogStatus.Active;

    await updateData<BlogDB>({
      collectionName: "BLOGS",
      docId: blogId,
      updatedData: {
        status: newStatus,
        updatedAt: Date.now(),
      },
    });
    sendRevalidateRequest(blogDoc.link);

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

export const startBlogWriting = async (
  title?: string
): Promise<ApiResponse<BlogFormData>> => {
  try {
    const newBlogFormData = createNewBlogFormData(title);

    await createData<BlogDB>({
      collectionName: "BLOGS",
      docId: newBlogFormData.blogId,
      data: blogFormDataToDB(newBlogFormData),
    });

    return formatResponse<BlogFormData>({
      status: "success",
      data: newBlogFormData,
      message: "Blog writing started successfully",
    });
  } catch (error) {
    console.error("Error while starting blog writing", error);
    return formatResponse({
      status: "error",
      data: null,
      message: "Error occured while starting blog writing",
    });
  }
};
