"use server";
import { z } from "zod";
import {
  createData,
  readSingleDoc,
  updateData,
  deleteDoc,
  readNDocs,
} from "@/lib/commonQuery";
import { measureEstReadTime, wrap } from "@/lib/appUtils";
import {
  createNewBlogFormData,
  draftDBToFormData,
  formDataToDraftDB,
  formDataToPublishedDB,
  publishedDBToFormData,
  sendRevalidateRequest,
} from "@/lib/blogUtils";
import {
  BlogDraftDB,
  BlogStatus,
  PublishedBlogDB,
  blogFormDataSchema,
} from "@/schemas/blogSchemas";

const blogIdSchema = z.string().min(1);
const optionalTitleSchema = z.string().optional();

// ============================================================================
// DRAFT ACTIONS (BLOG_DRAFTS collection)
// ============================================================================

export const startBlogWriting = wrap(async (title?: string) => {
  const parsedTitle = optionalTitleSchema.parse(title);
  const newBlogFormData = createNewBlogFormData(parsedTitle);

  await createData<BlogDraftDB>({
    collectionName: "BLOGS",
    docId: newBlogFormData.blogId,
    data: formDataToDraftDB(newBlogFormData),
  });

  return { data: newBlogFormData };
});

export const loadBlogForEditing = wrap(async (blogId: string) => {
  const parsedBlogId = blogIdSchema.parse(blogId);
  const blog = await readSingleDoc<PublishedBlogDB | BlogDraftDB>({
    collectionName: "BLOGS",
    docId: parsedBlogId,
  });

  if (!blog) throw new Error("Blog not found");

  // If it's already a draft, just convert and return
  if (blog.status === BlogStatus.draft)
    return { data: draftDBToFormData(blog) };

  // If published, check for existing draft first
  const existingDraft = (
    await readNDocs<BlogDraftDB>({
      collectionName: "BLOGS",
      filters: { parentBlogId: parsedBlogId },
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
  const blogFormData = blogFormDataSchema.parse(JSON.parse(blogFormDataString));

  // VALIDATION: Check if draft exists
  const existingDraft = await readSingleDoc<BlogDraftDB>({
    collectionName: "BLOGS",
    docId: blogFormData.blogId,
  });

  if (!existingDraft) {
    throw new Error(
      `Draft ${blogFormData.blogId} does not exist. Cannot save.`,
    );
  }

  // VALIDATION: Prevent parentBlogId changes
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

  return { data: draftDB };
});

export const discardDraftChanges = wrap(async (draftId: string) => {
  const parsedDraftId = blogIdSchema.parse(draftId);
  const draft = await readSingleDoc<BlogDraftDB>({
    collectionName: "BLOGS",
    docId: parsedDraftId,
  });

  if (!draft || !draft.parentBlogId)
    throw new Error("Draft not found or is a new draft");

  await deleteDoc({
    collectionName: "BLOGS",
    docId: parsedDraftId,
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
        dek: publishedBlog.dek,
        seoTitle: publishedBlog.seoTitle,
        socialDescription: publishedBlog.socialDescription,
        tags: publishedBlog.tags,
        socialTitle: publishedBlog.socialTitle,
        coverImageUrl: publishedBlog.coverImageUrl,
        content: JSON.parse(publishedBlog.content),
        readTime: publishedBlog.readTime,
        metaDescription: publishedBlog.metaDescription,
        publishedAt: publishedBlog.publishedAt,
        featured: publishedBlog.featured,
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
  await sendRevalidateRequest(publishedBlog.slug);

  return { data: null };
});

// ============================================================================
// PUBLISHED BLOG ACTIONS (BLOGS collection)
// ============================================================================

export const toggleBlogStatus = wrap(async (blogId: string) => {
  const blogDoc = await readSingleDoc<PublishedBlogDB>({
    collectionName: "BLOGS",
    docId: blogId,
    fieldsToRead: { status: true, slug: true },
  });

  if (!blogDoc) throw new Error("Blog does not exist");

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

  await sendRevalidateRequest(blogDoc.slug);

  return { data: null };
});

export const deleteBlog = wrap(async (blogId: string) => {
  const blogDoc = await readSingleDoc<{ slug: string }>({
    collectionName: "BLOGS",
    docId: blogId,
    fieldsToRead: { slug: true },
  });

  if (!blogDoc) throw new Error("Blog not found");

  await deleteDoc({
    collectionName: "BLOGS",
    docId: blogId,
  });

  await sendRevalidateRequest(blogDoc.slug);

  return { data: null };
});
