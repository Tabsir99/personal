"use server";
import {
  createData,
  readSingleDoc,
  updateData,
  deleteDoc,
  readNDocs,
} from "@/lib/commonQuery";
import {
  BlogFormData,
  BlogDraftDB,
  PublishedBlogDB,
  BlogStatus,
} from "@/types/blogTypes";
import { measureEstReadTime, wrap } from "@/lib/utils";
import {
  createNewBlogFormData,
  draftDBToFormData,
  formDataToDraftDB,
  formDataToPublishedDB,
  publishedDBToFormData,
  sendRevalidateRequest,
} from "@/lib/blogUtils";

// ============================================================================
// DRAFT ACTIONS (BLOG_DRAFTS collection)
// ============================================================================

export const startBlogWriting = wrap(async (title?: string) => {
  const newBlogFormData = createNewBlogFormData(title);

  await createData<BlogDraftDB>({
    collectionName: "BLOGS",
    docId: newBlogFormData.blogId,
    data: formDataToDraftDB(newBlogFormData),
  });

  return { data: newBlogFormData };
});

export const loadBlogForEditing = wrap(async (blogId: string) => {
  const blog = await readSingleDoc<PublishedBlogDB | BlogDraftDB>({
    collectionName: "BLOGS",
    docId: blogId,
  });

  if (!blog) throw new Error("Blog not found");

  // If it's already a draft, just convert and return
  if (blog.status === BlogStatus.Draft)
    return { data: draftDBToFormData(blog) };

  // If published, check for existing draft first
  const existingDraft = (
    await readNDocs<BlogDraftDB>({
      collectionName: "BLOGS",
      filters: { parentBlogId: blogId },
      cursorValue: null,
      limit: 1,
    })
  )[0];

  if (existingDraft) return { data: draftDBToFormData(existingDraft) };

  // Create new draft from published
  const draftFormData = publishedDBToFormData(blog);

  await createData<BlogDraftDB>({
    collectionName: "BLOGS",
    docId: draftFormData.blogId,
    data: formDataToDraftDB(draftFormData),
  });

  return { data: draftFormData };
});

export const saveDraft = wrap(async (blogFormDataString: string) => {
  const blogFormData = JSON.parse(blogFormDataString) as BlogFormData;

  if (!blogFormData.content) throw new Error("Content is required");

  // VALIDATION: Check if draft exists
  const existingDraft = await readSingleDoc<BlogDraftDB>({
    collectionName: "BLOGS",
    docId: blogFormData.blogId,
  });

  if (!existingDraft) {
    throw new Error(
      `Draft ${blogFormData.blogId} does not exist. Cannot save.`
    );
  }

  // VALIDATION: Prevent parentBlogId changes
  if (existingDraft.parentBlogId !== blogFormData.parentBlogId) {
    throw new Error("Cannot modify parentBlogId during save");
  }

  blogFormData.updatedAt = Date.now();
  blogFormData.estReadTime = measureEstReadTime(blogFormData.content);

  const draftDB = formDataToDraftDB(blogFormData);

  await updateData<BlogDraftDB>({
    collectionName: "BLOGS",
    docId: draftDB.blogId,
    updatedData: draftDB,
    merge: true,
  });

  return { data: draftDB };
});

export const discardDraftChanges = wrap(async (draftId: string) => {
  const draft = await readSingleDoc<BlogDraftDB>({
    collectionName: "BLOGS",
    docId: draftId,
  });

  if (!draft || !draft.parentBlogId)
    throw new Error("Draft not found or is a new draft");

  await deleteDoc({
    collectionName: "BLOGS",
    docId: draftId,
  });
  return { data: null };
});

// ============================================================================
// PUBLISH ACTIONS (BLOGS collection)
// ============================================================================

export const publishBlog = wrap(async (draftId: string) => {
  const draftDoc = await readSingleDoc<BlogDraftDB>({
    collectionName: "BLOGS",
    docId: draftId,
  });

  if (!draftDoc) throw new Error("Draft does not exist");

  const formData = draftDBToFormData(draftDoc);

  // If editing published blog, load published version for stats
  if (draftDoc.parentBlogId) {
    const publishedBlog = await readSingleDoc<PublishedBlogDB>({
      collectionName: "BLOGS",
      docId: draftDoc.parentBlogId,
    });

    if (publishedBlog) {
      formData.publishedVersion = {
        title: publishedBlog.title,
        description: publishedBlog.description,
        tags: publishedBlog.tags,
        socialTitle: publishedBlog.socialTitle,
        featuredImageUrl: publishedBlog.featuredImageUrl,
        recommendationTitle: publishedBlog.recommendationTitle,
        content: JSON.parse(publishedBlog.content),
        estReadTime: publishedBlog.estReadTime,
        publishedAt: publishedBlog.publishedAt,
      };
    }
  }

  // Convert to published format
  const publishedBlog = formDataToPublishedDB(formData);

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

  // Revalidate
  await sendRevalidateRequest(publishedBlog.link);

  return { data: null };
});

// ============================================================================
// PUBLISHED BLOG ACTIONS (BLOGS collection)
// ============================================================================

export const toggleBlogStatus = wrap(async (blogId: string) => {
  const blogDoc = await readSingleDoc<PublishedBlogDB>({
    collectionName: "BLOGS",
    docId: blogId,
    fieldsToRead: { status: true, link: true },
  });

  if (!blogDoc) throw new Error("Blog does not exist");

  const isActive = blogDoc.status === BlogStatus.Active;
  const newStatus = isActive ? BlogStatus.Inactive : BlogStatus.Active;

  await updateData<PublishedBlogDB>({
    collectionName: "BLOGS",
    docId: blogId,
    updatedData: {
      status: newStatus,
      updatedAt: Date.now(),
    },
  });

  await sendRevalidateRequest(blogDoc.link);

  return { data: null };
});

export const deleteBlog = wrap(async (blogId: string) => {
  const blogDoc = await readSingleDoc<{ link: string }>({
    collectionName: "BLOGS",
    docId: blogId,
    fieldsToRead: { link: true },
  });

  if (!blogDoc) throw new Error("Blog not found");

  await deleteDoc({
    collectionName: "BLOGS",
    docId: blogId,
  });

  await sendRevalidateRequest(blogDoc.link);

  return { data: null };
});
