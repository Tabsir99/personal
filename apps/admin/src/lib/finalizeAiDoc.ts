import "server-only";
import { randomBytes } from "crypto";
import type { AIDocContent, DocContent } from "@tabsircg/schemas/ai";
import { slugify } from "./appUtils";

const hex8 = () => randomBytes(4).toString("hex");

type BlockNode = DocContent["content"][number];
type AIBlock = AIDocContent["content"][number];

// Zod's `.optional()` outputs `T | undefined`, which clashes with DocContent's
// `attrs?: T` under apps/admin's `exactOptionalPropertyTypes: true`. The values
// constructed below ARE structurally valid `BlockNode`s at runtime — the cast
// per return bridges the type-system mismatch.
function finalizeBlock(block: AIBlock): BlockNode {
  switch (block.type) {
    case "paragraph":
      return {
        type: "paragraph",
        ...(block.attrs ? { attrs: block.attrs } : {}),
        ...(block.content ? { content: block.content } : {}),
      } as BlockNode;

    case "heading": {
      const text = (block.content ?? [])
        .map((n) => (n.type === "text" ? n.text : ""))
        .join("");
      return {
        type: "heading",
        attrs: {
          ...block.attrs,
          id: block.attrs.id?.trim() || slugify(text) || hex8(),
        },
        ...(block.content ? { content: block.content } : {}),
      } as BlockNode;
    }

    case "blockquote":
      return {
        type: "blockquote",
        ...(block.attrs ? { attrs: block.attrs } : {}),
        ...(block.content
          ? { content: block.content.map(finalizeBlock) }
          : {}),
      } as BlockNode;

    case "codeBlock":
      return {
        type: "codeBlock",
        attrs: { language: block.attrs.language },
        ...(block.content ? { content: block.content } : {}),
      } as BlockNode;

    case "horizontalRule":
      return { type: "horizontalRule" };

    case "callout":
      return {
        type: "callout",
        attrs: {
          ...block.attrs,
          hexId: block.attrs.hexId?.trim() || hex8(),
        },
        ...(block.content
          ? { content: block.content.map(finalizeBlock) }
          : {}),
      } as BlockNode;

    case "bulletList":
      return {
        type: "bulletList",
        ...(block.content
          ? {
              content: block.content.map((li) => ({
                type: "listItem" as const,
                ...(li.content
                  ? { content: li.content.map(finalizeBlock) }
                  : {}),
              })),
            }
          : {}),
      } as BlockNode;

    case "orderedList":
      return {
        type: "orderedList",
        attrs: { start: block.attrs.start, type: block.attrs.type },
        ...(block.content
          ? {
              content: block.content.map((li) => ({
                type: "listItem" as const,
                ...(li.content
                  ? { content: li.content.map(finalizeBlock) }
                  : {}),
              })),
            }
          : {}),
      } as BlockNode;
  }
}

export function finalizeAiDoc(ai: AIDocContent): DocContent {
  return {
    type: "doc",
    content: ai.content.map(finalizeBlock),
  };
}
