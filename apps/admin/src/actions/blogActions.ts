"use server";
import { z } from "zod";
import {
  createData,
  updateData,
  deleteDoc,
  readNDocs,
} from "@/lib/commonQuery";
import { readSingleBlog } from "@/lib/blogQuery";
import { measureEstReadTime, wrap } from "@/lib/appUtils";
import {
  createNewBlogFormData,
  draftDBToFormData,
  formDataToDraftDB,
  formDataToPublishedDB,
  publishedDBToFormData,
  revalidateBlog,
} from "@/lib/blogUtils";
import {
  BlogDraftDB,
  BlogStatus,
  PublishedBlogDB,
  blogFormDataSchema,
} from "@tabsircg/schemas/blog";

const blogIdSchema = z.string().min(1);
const optionalTitleSchema = z.string().optional();

export const startBlogWriting = wrap(async (title?: string) => {
  const parsedTitle = optionalTitleSchema.parse(title);
  const newBlogFormData = createNewBlogFormData(parsedTitle);

  await createData<BlogDraftDB>({
    collectionName: "BLOGS",
    docId: newBlogFormData.blogId,
    data: formDataToDraftDB(newBlogFormData),
  });

  return newBlogFormData;
});

export const loadBlogForEditing = wrap(async (blogId: string) => {
  const parsedBlogId = blogIdSchema.parse(blogId);
  const blog = await readSingleBlog<PublishedBlogDB | BlogDraftDB>({
    docId: parsedBlogId,
  });

  if (!blog) throw new Error("Blog not found");

  if (blog.status === BlogStatus.draft) return draftDBToFormData(blog);

  const existingDraft = (
    await readNDocs<BlogDraftDB>({
      collectionName: "BLOGS",
      filters: { parentBlogId: parsedBlogId },
      cursorValue: null,
      limit: 1,
    })
  )[0];

  if (existingDraft) return draftDBToFormData(existingDraft);

  const draftFormData = publishedDBToFormData(blog);

  await createData<BlogDraftDB>({
    collectionName: "BLOGS",
    docId: draftFormData.blogId,
    data: formDataToDraftDB(draftFormData),
  });

  return draftFormData;
});

export const saveDraft = wrap(async (blogFormDataString: string) => {
  const blogFormData = blogFormDataSchema.parse(JSON.parse(blogFormDataString));

  const existingDraft = await readSingleBlog<BlogDraftDB>({
    docId: blogFormData.blogId,
  });

  if (!existingDraft) {
    throw new Error(
      `Draft ${blogFormData.blogId} does not exist. Cannot save.`,
    );
  }

  if (existingDraft.parentBlogId !== blogFormData.parentBlogId) {
    throw new Error("Cannot modify parentBlogId during save");
  }

  blogFormData.updatedAt = Date.now();
  blogFormData.readTime = await measureEstReadTime(blogFormData.content);

  const draftDB = formDataToDraftDB(blogFormData);

  await updateData<BlogDraftDB>({
    collectionName: "BLOGS",
    docId: draftDB.blogId,
    updatedData: draftDB,
    merge: true,
  });

  return draftDB;
});

export const discardDraftChanges = wrap(async (draftId: string) => {
  const parsedDraftId = blogIdSchema.parse(draftId);
  const draft = await readSingleBlog<BlogDraftDB>({
    docId: parsedDraftId,
  });

  if (!draft) throw new Error("Draft not found");
  if (!draft.parentBlogId)
    throw new Error("Cannot discard a new draft — use delete instead");

  await deleteDoc({
    collectionName: "BLOGS",
    docId: parsedDraftId,
  });
  return null;
});

export const publishBlog = wrap(async (draftId: string) => {
  const draftDoc = await readSingleBlog<BlogDraftDB>({
    docId: draftId,
  });

  if (!draftDoc) throw new Error("Draft does not exist");

  const formData = draftDBToFormData(draftDoc);

  let existingPublished: PublishedBlogDB | null = null;
  if (draftDoc.parentBlogId) {
    existingPublished = await readSingleBlog<PublishedBlogDB>({
      docId: draftDoc.parentBlogId,
    });
  }

  const publishedBlog = formDataToPublishedDB(formData, existingPublished);

  await updateData<PublishedBlogDB>({
    collectionName: "BLOGS",
    docId: publishedBlog.blogId,
    updatedData: publishedBlog,
    merge: false,
  });

  if (draftDoc.parentBlogId) {
    await deleteDoc({
      collectionName: "BLOGS",
      docId: draftId,
    });
  }

  await revalidateBlog(publishedBlog.slug);

  return null;
});

export const toggleBlogStatus = wrap(async (blogId: string) => {
  const blogDoc = await readSingleBlog<PublishedBlogDB>({
    docId: blogId,
    fieldsToRead: { status: true, slug: true },
  });

  if (!blogDoc) throw new Error("Blog does not exist");

  if (
    blogDoc.status !== BlogStatus.published &&
    blogDoc.status !== BlogStatus.unpublished
  ) {
    throw new Error(`Cannot toggle status from "${blogDoc.status}"`);
  }

  const isActive = blogDoc.status === BlogStatus.published;
  const newStatus = isActive ? BlogStatus.unpublished : BlogStatus.published;

  await updateData<PublishedBlogDB>({
    collectionName: "BLOGS",
    docId: blogId,
    updatedData: {
      status: newStatus,
      updatedAt: Date.now(),
    },
  });

  await revalidateBlog(blogDoc.slug);

  return null;
});

export const featureBlog = wrap(async (blogId: string) => {
  const parsedBlogId = blogIdSchema.parse(blogId);
  const blogDoc = await readSingleBlog<{ slug: string; status: BlogStatus }>({
    docId: parsedBlogId,
    fieldsToRead: { slug: true, status: true },
  });
  if (!blogDoc) throw new Error("Blog not found");
  if (blogDoc.status === BlogStatus.draft) {
    throw new Error("Drafts can't be featured — publish first.");
  }

  await updateData<PublishedBlogDB>({
    collectionName: "BLOGS",
    docId: parsedBlogId,
    updatedData: {
      featuredAt: Date.now(),
      updatedAt: Date.now(),
    },
  });

  await revalidateBlog(blogDoc.slug);
  return null;
});

export const updateBlogCoverImage = wrap(
  async (blogId: string, coverImageUrl: string) => {
    const parsedBlogId = blogIdSchema.parse(blogId);
    const parsedUrl = z.string().min(1).parse(coverImageUrl);

    const blogDoc = await readSingleBlog<{ slug: string }>({
      docId: parsedBlogId,
      fieldsToRead: { slug: true },
    });
    if (!blogDoc) throw new Error("Blog not found");

    await updateData<PublishedBlogDB>({
      collectionName: "BLOGS",
      docId: parsedBlogId,
      updatedData: {
        coverImageUrl: parsedUrl,
        updatedAt: Date.now(),
      },
    });

    await revalidateBlog(blogDoc.slug);

    return null;
  },
);

export const deleteBlog = wrap(async (blogId: string) => {
  const blogDoc = await readSingleBlog<{ slug: string }>({
    docId: blogId,
    fieldsToRead: { slug: true },
  });

  if (!blogDoc) throw new Error("Blog not found");

  await deleteDoc({
    collectionName: "BLOGS",
    docId: blogId,
  });

  await revalidateBlog(blogDoc.slug);

  return null;
});
