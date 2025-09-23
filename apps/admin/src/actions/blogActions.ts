"use server";
import { deleteBlogdb } from "@/lib/blogQuery";
import { createData, readSingleDoc, updateData } from "@/lib/commonQuery";
import { Blog, BlogFormData, BlogStatus, BlogType } from "@/types/blogTypes";
import { ApiResponse, buildBlog, formatResponse } from "@/utils/utils";
import { JSONContent } from "@tiptap/react";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export async function saveDraft(
  blogFormData: BlogFormData
): Promise<ApiResponse<Blog>> {
  const draftExists = await readSingleDoc<Blog>({
    collectionName: "BLOGS",
    docId: blogFormData.blogId,
    fieldsToRead: { blogId: true },
  });

  if (!draftExists) {
    throw new Error("Draft does not exists");
  }

  const draftBlog = buildBlog(blogFormData);

  try {
    await createData<Blog>({
      collectionName: "BLOGS",
      docId: draftBlog.blogId,
      data: draftBlog,
    });
    revalidatePath("/dashboard", "layout");
    return formatResponse({
      status: "success",
      data: draftBlog,
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

export async function uploadBlog(
  blogFormData: BlogFormData
): Promise<ApiResponse<null>> {
  const blog = buildBlog(blogFormData);

  const blogDoc = await readSingleDoc<Blog>({
    collectionName: "BLOGS",
    docId: blog.blogId,
    fieldsToRead: { status: true, link: true },
  });

  if (!blogDoc)
    throw new Error(
      "Blog metadata does not exists. System error as it must exist before uploading"
    );

  try {
    revalidatePath("/", "layout");
    return formatResponse({
      status: "success",
      data: null,
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

export async function deleteBlog(blogId: string) {
  try {
    const blogStatus = await readSingleDoc<Blog>({
      docId: blogId,
      collectionName: "BLOGS",
      fieldsToRead: { status: true },
    });

    if (!blogStatus) {
      throw new Error("Blog not found, so not deleted");
    }

    await deleteBlogdb({
      blogId,
      isDraft: blogStatus.status === "draft",
    });

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
    const blogDoc = await readSingleDoc<Blog>({
      collectionName: "BLOGS",
      docId: blogId,
      fieldsToRead: { status: true },
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

    await updateData<Blog>({
      collectionName: "BLOGS",
      docId: blogId,
      updatedData: {
        status: newStatus,
        updatedAt: Date.now(),
      },
    });

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

export const startBlogWriting = async (): Promise<
  ApiResponse<BlogFormData>
> => {
  try {
    const defaultContent: JSONContent = {
      type: "doc",
      content: [
        {
          type: "section",
          content: [
            // @ts-ignore
            {
              type: "paragraph",
              content: [],
              key: "1",
            },
          ],
        },
      ],
    };

    const newBlogId = randomUUID();
    const newBlog: Blog = {
      blogName: `Untitled Blog ${new Date().toLocaleDateString()}s`,
      blogDescription: "",
      blogTags: [],
      content: JSON.stringify(defaultContent),
      featuredImageUrl: "",

      createdAt: Date.now(),
      updatedAt: Date.now(),
      hasDraftChanges: false,

      estReadTime: 0,
      link: "",
      type: BlogType.Article,
      recommendations: [],
      recommendationTitle: "",
      socialTitle: "",
      status: BlogStatus.Draft,

      blogId: newBlogId,
      blogStats: {
        totalComments: 0,
        totalLikes: 0,
        totalShares: 0,
        totalViews: 0,
      },
    };
    await createData<Blog>({
      collectionName: "BLOGS",
      docId: newBlogId,
      data: newBlog,
    });

    return formatResponse<BlogFormData>({
      status: "success",
      data: {
        blogDescription: newBlog.blogDescription,
        blogId: newBlog.blogId,
        blogName: newBlog.blogName,
        blogTags: newBlog.blogTags,
        recommendationTitle: newBlog.recommendationTitle,
        content: defaultContent,
        featuredImageUrl: newBlog.featuredImageUrl,
        link: newBlog.link,
        socialTitle: newBlog.socialTitle,
        status: newBlog.status,
        type: newBlog.type,
      } as BlogFormData,
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
