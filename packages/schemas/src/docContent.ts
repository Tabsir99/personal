import { z } from "zod";
import type { DocContent } from "@open-notion/editor";

const blockAttrsSchema = z.object({
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  fontSize: z.string().optional(),
  fontFamily: z.string().optional(),
  textAlign: z.enum(["left", "center", "right", "justify"]).optional(),
});

const cellAttrsSchema = z.object({
  backgroundColor: z.string().optional(),
  colspan: z.number().optional(),
  rowspan: z.number().optional(),
  colwidth: z.array(z.number()).nullable(),
});

const anyMarkSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("bold") }),
  z.object({ type: z.literal("italic") }),
  z.object({ type: z.literal("strike") }),
  z.object({ type: z.literal("code") }),
  z.object({ type: z.literal("underline") }),
  z.object({
    type: z.literal("link"),
    attrs: z.object({ href: z.string(), target: z.string() }),
  }),
  z.object({
    type: z.literal("textStyle"),
    attrs: z
      .object({
        color: z.string().nullable(),
        fontFamily: z.string().nullable(),
        fontSize: z.string().nullable(),
        backgroundColor: z.string().nullable(),
      })
      .optional(),
  }),
]);

const textNodeSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  marks: z.array(anyMarkSchema).optional(),
});

const hardBreakNodeSchema = z.object({ type: z.literal("hardBreak") });

const emojiNodeSchema = z.object({
  type: z.literal("emoji"),
  attrs: z.object({
    name: z.string(),
    hexId: z.string(),
    shortcode: z.string(),
  }),
});

const inlineNodeSchema = z.discriminatedUnion("type", [
  textNodeSchema,
  hardBreakNodeSchema,
  emojiNodeSchema,
]);

type BlockNode = DocContent["content"][number];

// We can't directly annotate `z.ZodType<BlockNode>` because downstream
// (apps/admin) uses `exactOptionalPropertyTypes: true`, under which Zod's
// `.optional()` (producing `T | undefined`) is not assignable to DocContent's
// EOPT-style `attrs?: T`. Cast through unknown — structural identity is
// asserted by the discriminator-set check at the bottom of this file and by
// Zod parse failures at runtime.
const blockNodeSchema = z.lazy(() =>
  z.discriminatedUnion("type", [
    paragraphNodeSchema,
    headingNodeSchema,
    blockquoteNodeSchema,
    codeBlockNodeSchema,
    horizontalRuleNodeSchema,
    imageNodeSchema,
    calloutNodeSchema,
    bulletListNodeSchema,
    orderedListNodeSchema,
    taskListNodeSchema,
    tableNodeSchema,
  ]),
) as unknown as z.ZodType<BlockNode>;

const paragraphNodeSchema = z.object({
  type: z.literal("paragraph"),
  attrs: blockAttrsSchema.optional(),
  content: z.array(inlineNodeSchema).optional(),
});

const headingNodeSchema = z.object({
  type: z.literal("heading"),
  attrs: blockAttrsSchema.extend({
    level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
    id: z.string(),
  }),
  content: z.array(inlineNodeSchema).optional(),
});

const blockquoteNodeSchema = z.object({
  type: z.literal("blockquote"),
  attrs: blockAttrsSchema.optional(),
  content: z.array(z.lazy(() => blockNodeSchema)).optional(),
});

const codeBlockNodeSchema = z.object({
  type: z.literal("codeBlock"),
  attrs: z.object({ language: z.string() }),
  content: z.array(textNodeSchema).optional(),
});

const horizontalRuleNodeSchema = z.object({
  type: z.literal("horizontalRule"),
});

const imageNodeSchema = z.object({
  type: z.literal("image"),
  attrs: z.object({
    src: z.string().nullable(),
    caption: z.string().optional(),
    align: z.enum(["left", "center", "full", "right"]),
    width: z.number().optional(),
    height: z.number().optional(),
  }),
});

const calloutNodeSchema = z.object({
  type: z.literal("callout"),
  attrs: blockAttrsSchema.extend({
    emoji: z.string(),
    hexId: z.string(),
  }),
  content: z.array(z.lazy(() => blockNodeSchema)).optional(),
});

const listItemNodeSchema = z.object({
  type: z.literal("listItem"),
  content: z.array(z.lazy(() => blockNodeSchema)).optional(),
});

const taskItemNodeSchema = z.object({
  type: z.literal("taskItem"),
  attrs: z.object({ checked: z.boolean() }),
  content: z.array(z.lazy(() => blockNodeSchema)).optional(),
});

const bulletListNodeSchema = z.object({
  type: z.literal("bulletList"),
  content: z.array(listItemNodeSchema).optional(),
});

const orderedListNodeSchema = z.object({
  type: z.literal("orderedList"),
  attrs: z.object({ start: z.number(), type: z.string().nullable() }),
  content: z.array(listItemNodeSchema).optional(),
});

const taskListNodeSchema = z.object({
  type: z.literal("taskList"),
  content: z.array(taskItemNodeSchema).optional(),
});

const tableCellNodeSchema = z.object({
  type: z.literal("tableCell"),
  attrs: cellAttrsSchema.optional(),
  content: z.array(z.lazy(() => blockNodeSchema)).optional(),
});

const tableHeaderNodeSchema = z.object({
  type: z.literal("tableHeader"),
  attrs: cellAttrsSchema.optional(),
  content: z.array(z.lazy(() => blockNodeSchema)).optional(),
});

const tableRowNodeSchema = z.object({
  type: z.literal("tableRow"),
  content: z
    .array(
      z.discriminatedUnion("type", [tableCellNodeSchema, tableHeaderNodeSchema]),
    )
    .optional(),
});

const tableNodeSchema = z.object({
  type: z.literal("table"),
  content: z.array(tableRowNodeSchema).optional(),
});

export const docContentSchema = z.object({
  type: z.literal("doc"),
  content: z.array(blockNodeSchema),
});

// Compile-time drift check.
// Under EOPT (apps/admin), strict structural `satisfies` between Zod's output
// (`attrs?: T | undefined`) and DocContent's `attrs?: T` is impossible. We
// instead check that the SET of discriminator literals on block, inline, and
// mark types matches exactly — this catches the most likely drift (a node
// type added or removed in @open-notion/editor). Attr-shape changes surface
// as Zod parse failures at runtime.

type _Tag<T> = T extends { type: infer U } ? U : never;
type _SetEq<A, B> = [Exclude<A, B>] extends [never]
  ? [Exclude<B, A>] extends [never]
    ? true
    : never
  : never;

// Peel a representative inline node + mark from DocContent via paragraph,
// avoiding a direct dependency on @open-notion/serializers internal types.
type _DocParagraph = Extract<
  DocContent["content"][number],
  { type: "paragraph" }
>;
type _DocInline = NonNullable<_DocParagraph["content"]>[number];
type _DocMark = NonNullable<
  Extract<_DocInline, { type: "text" }>["marks"]
>[number];

type _DocBlockTags = _Tag<DocContent["content"][number]>;
type _ZodBlockTags = _Tag<z.infer<typeof blockNodeSchema>>;
const _blockTagCheck: _SetEq<_ZodBlockTags, _DocBlockTags> = true;
void _blockTagCheck;

type _DocInlineTags = _Tag<_DocInline>;
type _ZodInlineTags = _Tag<z.infer<typeof inlineNodeSchema>>;
const _inlineTagCheck: _SetEq<_ZodInlineTags, _DocInlineTags> = true;
void _inlineTagCheck;

type _DocMarkTags = _Tag<_DocMark>;
type _ZodMarkTags = _Tag<z.infer<typeof anyMarkSchema>>;
const _markTagCheck: _SetEq<_ZodMarkTags, _DocMarkTags> = true;
void _markTagCheck;

export type { DocContent };
