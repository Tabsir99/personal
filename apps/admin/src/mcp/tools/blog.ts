import "server-only";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { docToText } from "@open-notion/editor";
import { aiDocContentSchema } from "@tabsircg/schemas/ai";
import { BlogStatus, type PublishedBlogDB } from "@tabsircg/schemas/blog";
import type { BlogListRow } from "../types";
import { readNDocs } from "@/lib/commonQuery";
import { readSingleBlog } from "@/lib/blogQuery";
import { finalizeAiDoc } from "@/lib/finalizeAiDoc";
import { measureEstReadTime } from "@/lib/appUtils";
import { env } from "@/config/env.server";
import {
  startBlogWriting,
  loadBlogForEditing,
  saveDraft,
  publishBlog,
  toggleBlogStatus,
  featureBlog,
  deleteBlog,
} from "@/actions/blogActions";
import { guarded, table, unwrap } from "../result";

const statusSchema = z
  .enum(["published", "unpublished", "archived", "draft"])
  .optional()
  .describe("Filter by status. Omit for all.");

const metadataPatchSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  dek: z.string().max(200).optional(),
  excerpt: z.string().max(280).optional(),
  seoTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  socialTitle: z.string().max(70).optional(),
  socialDescription: z.string().max(200).optional(),
  tags: z.array(z.string()).max(5).optional(),
  kind: z.string().optional(),
});

const docSchema = aiDocContentSchema.describe(
  "Body content as an AI document: { content: [ { type: 'paragraph' | 'heading' | 'blockquote' | 'codeBlock' | 'bulletList' | 'orderedList' | 'horizontalRule', ... } ] }. Heading levels are 2-4. Ids and read time are filled in automatically.",
);

export function registerBlogTools(server: McpServer) {
  server.registerTool(
    "blog_list",
    {
      title: "List blog posts",
      description:
        "Blog posts with their id, slug, status, tags and timestamps. Content is not read, so this is cheap. Use blog_get for a single post's body.",
      inputSchema: z.object({
        status: statusSchema,
        tag: z
          .string()
          .optional()
          .describe("Filter to posts carrying this tag."),
        limit: z.number().int().positive().max(50).default(25),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ status, tag, limit }) =>
      guarded(async () => {
        const posts = await readNDocs<BlogListRow>({
          collectionName: "BLOGS",
          limit,
          cursorValue: null,
          ...(status ? { filters: { status } } : {}),
          ...(tag ? { arrayContainsFilters: { tags: tag } } : {}),
          fieldsToRead: {
            blogId: true,
            title: true,
            slug: true,
            status: true,
            tags: true,
            kind: true,
            createdAt: true,
            publishedAt: true,
            featuredAt: true,
          },
        });

        return table(
          posts.map((post) => ({
            blogId: post.blogId,
            title: post.title,
            slug: post.slug,
            status: post.status,
            kind: post.kind,
            tags: (post.tags ?? []).join(", "),
            published: post.publishedAt
              ? new Date(post.publishedAt).toISOString().slice(0, 10)
              : "",
            featured: post.featuredAt ? "yes" : "",
          })),
          limit,
        );
      }),
  );

  server.registerTool(
    "blog_get",
    {
      title: "Read a blog post",
      description:
        "Full metadata plus the body rendered as plain text, for a blog id. Use blog_list to find the id.",
      inputSchema: z.object({ blogId: z.string().min(1) }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ blogId }) =>
      guarded(async () => {
        const post = await readSingleBlog<PublishedBlogDB>({ docId: blogId });
        if (!post) throw new Error(`No blog with id ${blogId}`);

        const parsed =
          typeof post.content === "string"
            ? JSON.parse(post.content)
            : post.content;
        const body = await docToText(parsed);

        return [
          `Title      ${post.title}`,
          `Slug       ${post.slug}`,
          `Status     ${post.status}`,
          `Kind       ${post.kind ?? ""}`,
          `Tags       ${(post.tags ?? []).join(", ")}`,
          `Dek        ${post.dek ?? ""}`,
          `Excerpt    ${post.excerpt ?? ""}`,
          `Read time  ${post.readTime ?? 0} min`,
          `Featured   ${post.featuredAt ? new Date(post.featuredAt).toISOString() : "no"}`,
          "",
          "--- body ---",
          body,
        ].join("\n");
      }),
  );

  server.registerTool(
    "blog_create_draft",
    {
      title: "Create a blog draft",
      description:
        "Start a new draft with a title and optional body. Returns the draft's blogId. The draft is not visible on the public site until blog_publish.",
      inputSchema: z.object({
        title: z.string().min(1).max(120),
        doc: docSchema.optional(),
        metadata: metadataPatchSchema.optional(),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
      },
    },
    async ({ title, doc, metadata }) =>
      guarded(async () => {
        const created = unwrap(await startBlogWriting(title));

        if (!doc && !metadata) {
          return `Created draft ${created.blogId} titled "${created.title}".`;
        }

        const content = doc ? finalizeAiDoc(doc) : created.content;
        const merged = {
          ...created,
          ...(metadata ?? {}),
          title,
          content,
          readTime: await measureEstReadTime(content),
        };

        unwrap(await saveDraft(JSON.stringify(merged)));
        return `Created draft ${created.blogId} titled "${title}".`;
      }),
  );

  server.registerTool(
    "blog_update_draft",
    {
      title: "Update a blog draft",
      description:
        "Patch a post's metadata and/or replace its body. Pass the id of a draft or a published post — for a published post this opens (or reuses) its draft, so the public site is untouched until blog_publish. Only the fields you pass change.",
      inputSchema: z.object({
        blogId: z.string().min(1),
        doc: docSchema.optional(),
        metadata: metadataPatchSchema.optional(),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
      },
    },
    async ({ blogId, doc, metadata }) =>
      guarded(async () => {
        if (!doc && !metadata) throw new Error("Pass doc, metadata, or both.");

        const draft = unwrap(await loadBlogForEditing(blogId));
        const content = doc ? finalizeAiDoc(doc) : draft.content;
        const merged = {
          ...draft,
          ...(metadata ?? {}),
          content,
          readTime: await measureEstReadTime(content),
        };

        unwrap(await saveDraft(JSON.stringify(merged)));

        const changed = [
          ...(doc ? ["body"] : []),
          ...Object.keys(metadata ?? {}),
        ].join(", ");
        return `Updated draft ${draft.blogId} (${changed}). Publish with blog_publish.`;
      }),
  );

  server.registerTool(
    "blog_publish",
    {
      title: "Publish a blog draft",
      description:
        "Publish a draft to the live site and revalidate the portfolio's cached pages. This makes the content publicly visible.",
      inputSchema: z.object({ draftId: z.string().min(1) }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async ({ draftId }) =>
      guarded(async () => {
        unwrap(await publishBlog(draftId));
        return `Published ${draftId}. Portfolio pages revalidated.`;
      }),
  );

  server.registerTool(
    "blog_set_status",
    {
      title: "Toggle published/unpublished",
      description:
        "Flip a post between published and unpublished and revalidate the portfolio. Unpublishing removes it from the public site.",
      inputSchema: z.object({ blogId: z.string().min(1) }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: true,
      },
    },
    async ({ blogId }) =>
      guarded(async () => {
        unwrap(await toggleBlogStatus(blogId));
        const post = await readSingleBlog<{ status: BlogStatus }>({
          docId: blogId,
          fieldsToRead: { status: true },
        });
        return `${blogId} is now ${post?.status ?? "updated"}.`;
      }),
  );

  server.registerTool(
    "blog_feature",
    {
      title: "Feature a blog post",
      description:
        "Make this post the featured one on the blog index. Featuring is one-way — it replaces whichever post was featured before, and there is no unfeature.",
      inputSchema: z.object({ blogId: z.string().min(1) }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async ({ blogId }) =>
      guarded(async () => {
        unwrap(await featureBlog(blogId));
        return `${blogId} is now the featured post.`;
      }),
  );

  if (!env.MCP_ALLOW_DELETES) return;

  server.registerTool(
    "blog_delete",
    {
      title: "Delete a blog post",
      description:
        "Permanently delete a post or draft from Firestore and revalidate the portfolio. There is no undo. Confirm the id with blog_get first.",
      inputSchema: z.object({ blogId: z.string().min(1) }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: true,
      },
    },
    async ({ blogId }) =>
      guarded(async () => {
        unwrap(await deleteBlog(blogId));
        return `Deleted ${blogId}.`;
      }),
  );
}
