import { z } from "zod";
import type { DocContent } from "./docContent";

export const aiBlogMetadataSchema = z.object({
  title: z.string().min(1).max(120),
  dek: z.string().max(200),
  excerpt: z.string().max(280),
  seoTitle: z.string().max(60),
  metaDescription: z.string().max(160),
  socialTitle: z.string().max(70),
  socialDescription: z.string().max(200),
  tags: z.array(z.string()).max(5).default([]),
});

export type AIBlogMetadata = z.infer<typeof aiBlogMetadataSchema>;

// --- AI draft generation ---------------------------------------------------
// AI emits a DocContent-shaped JSON that's MOSTLY strict; only auto-derivable
// required attrs are made optional. The normalizer in apps/admin fills them
// in and returns a value that satisfies the strict `DocContent`.

const aiBlockAttrsSchema = z.object({
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  fontSize: z.string().optional(),
  fontFamily: z.string().optional(),
  textAlign: z.enum(["left", "center", "right", "justify"]).optional(),
});

const aiAnyMarkSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("bold") }),
  z.object({ type: z.literal("italic") }),
  z.object({ type: z.literal("code") }),
  z.object({
    type: z.literal("link"),
    attrs: z.object({
      href: z
        .string()
        .refine(
          (s) => /^https?:\/\//i.test(s) || s.startsWith("/") || s.startsWith("#"),
          "Link href must be http(s), root-relative, or anchor",
        ),
      target: z.string().default("_blank"),
    }),
  }),
]);

const aiTextNodeSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  marks: z.array(aiAnyMarkSchema).optional(),
});

const aiHardBreakNodeSchema = z.object({ type: z.literal("hardBreak") });

const aiInlineNodeSchema = z.discriminatedUnion("type", [
  aiTextNodeSchema,
  aiHardBreakNodeSchema,
]);

type AIInlineNode = z.infer<typeof aiInlineNodeSchema>;
type AITextNode = z.infer<typeof aiTextNodeSchema>;
type AIBlockAttrs = z.infer<typeof aiBlockAttrsSchema>;

type AIListItem = { type: "listItem"; content?: AIBlockNode[] };

export type AIBlockNode =
  | { type: "paragraph"; attrs?: AIBlockAttrs; content?: AIInlineNode[] }
  | {
      type: "heading";
      attrs: AIBlockAttrs & { level: 2 | 3 | 4; id?: string };
      content?: AIInlineNode[];
    }
  | { type: "blockquote"; attrs?: AIBlockAttrs; content?: AIBlockNode[] }
  | {
      type: "codeBlock";
      attrs: { language: string };
      content?: AITextNode[];
    }
  | { type: "horizontalRule" }
  | {
      type: "callout";
      attrs: AIBlockAttrs & { emoji: string; hexId?: string };
      content?: AIBlockNode[];
    }
  | { type: "bulletList"; content?: AIListItem[] }
  | {
      type: "orderedList";
      attrs: { start: number; type: string | null };
      content?: AIListItem[];
    };

// EOPT cast — see docContent.ts for the rationale.
const aiListItemNodeSchema = z.lazy(() =>
  z.object({
    type: z.literal("listItem"),
    content: z.array(z.lazy(() => aiBlockNodeSchema)).optional(),
  }),
) as unknown as z.ZodType<AIListItem>;

const aiBlockNodeSchema = z.lazy(() =>
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal("paragraph"),
      attrs: aiBlockAttrsSchema.optional(),
      content: z.array(aiInlineNodeSchema).optional(),
    }),
    z.object({
      type: z.literal("heading"),
      attrs: aiBlockAttrsSchema.extend({
        level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
        id: z.string().optional(),
      }),
      content: z.array(aiInlineNodeSchema).optional(),
    }),
    z.object({
      type: z.literal("blockquote"),
      attrs: aiBlockAttrsSchema.optional(),
      content: z.array(z.lazy(() => aiBlockNodeSchema)).optional(),
    }),
    z.object({
      type: z.literal("codeBlock"),
      attrs: z.object({ language: z.string() }),
      content: z.array(aiTextNodeSchema).optional(),
    }),
    z.object({ type: z.literal("horizontalRule") }),
    z.object({
      type: z.literal("callout"),
      attrs: aiBlockAttrsSchema.extend({
        emoji: z.string().min(1),
        hexId: z.string().optional(),
      }),
      content: z.array(z.lazy(() => aiBlockNodeSchema)).optional(),
    }),
    z.object({
      type: z.literal("bulletList"),
      content: z.array(aiListItemNodeSchema).optional(),
    }),
    z.object({
      type: z.literal("orderedList"),
      attrs: z.object({
        start: z.number().default(1),
        type: z.string().nullable().default(null),
      }),
      content: z.array(aiListItemNodeSchema).optional(),
    }),
  ]),
) as unknown as z.ZodType<AIBlockNode>;

export const aiDocContentSchema = z.object({
  type: z.literal("doc"),
  content: z.array(aiBlockNodeSchema).min(1),
});
export type AIDocContent = z.infer<typeof aiDocContentSchema>;

export const aiBlogDraftSchema = z.object({
  title: z.string().min(1).max(120),
  doc: aiDocContentSchema,
});
export type AIBlogDraft = z.infer<typeof aiBlogDraftSchema>;

// Re-export the strict DocContent type for downstream consumers
export type { DocContent };
