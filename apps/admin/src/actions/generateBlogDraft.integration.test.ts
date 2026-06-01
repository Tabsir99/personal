import { describe, expect, it } from "vitest";
import { generateBlogDraftContent } from "./aiActions";
import { finalizeAiDoc } from "@/lib/finalizeAiDoc";

/**
 * Integration test for the AI draft generator. Hits the real Anthropic API
 * via `sendPrompt` — uses the actual `DRAFT_SYSTEM_PROMPT`, the actual
 * `aiBlogDraftSchema`, the actual finalize step. NOT end-to-end: skips
 * auth and Firestore writes (those happen in the server-action wrapper).
 *
 * Self-skips when `ANTHROPIC_AUTH_TOKEN` is not present.
 *
 * Run with: `pnpm -F admin test` (or set the env var first to actually fire).
 */
const RUN = Boolean(process.env.ANTHROPIC_AUTH_TOKEN);

const describeMaybe = RUN ? describe : describe.skip;

const FORBIDDEN_BLOCK_TYPES = new Set([
  "image",
  "taskList",
  "taskItem",
  "table",
  "tableRow",
  "tableCell",
  "tableHeader",
]);

const FORBIDDEN_MARK_TYPES = new Set(["strike", "underline", "textStyle"]);
const FORBIDDEN_INLINE_TYPES = new Set(["emoji"]);

type Block = { type: string; content?: Array<Block | InlineNode> };
type InlineNode = { type: string; marks?: Array<{ type: string }> };

function walkBlocks(blocks: Block[], onBlock: (b: Block) => void) {
  for (const block of blocks) {
    onBlock(block);
    if (Array.isArray(block.content)) {
      walkBlocks(block.content as Block[], onBlock);
    }
  }
}

function walkInlines(blocks: Block[], onInline: (n: InlineNode) => void) {
  for (const block of blocks) {
    if (Array.isArray(block.content)) {
      for (const child of block.content) {
        if ("text" in child || "marks" in child) {
          onInline(child as InlineNode);
        } else {
          walkInlines([child as Block], onInline);
        }
      }
    }
  }
}

describeMaybe("generateBlogDraftContent — real Anthropic call", () => {
  it(
    "produces a structured essay draft for a real topic",
    async () => {
      const topic =
        "Why JSON Schema's `pattern` keyword is unreliable for AI structured " +
        "output — what to use instead. Lean on real model behaviour, not docs.";
      const { ai, cleanKind } = await generateBlogDraftContent(topic, "essay");

      // Dump the full AI output so the human reader can eyeball voice/shape.
      // eslint-disable-next-line no-console
      console.log("\n========== AI OUTPUT ==========");
      // eslint-disable-next-line no-console
      console.log("kind sent:", cleanKind);
      // eslint-disable-next-line no-console
      console.log("title:    ", ai.title);
      // eslint-disable-next-line no-console
      console.log("blocks:   ", ai.doc.content.length);
      // eslint-disable-next-line no-console
      console.log(
        "types:    ",
        ai.doc.content.map((b: { type: string }) => b.type).join(", "),
      );
      // eslint-disable-next-line no-console
      console.log("=============================");
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(ai, null, 2));
      // eslint-disable-next-line no-console
      console.log("===== END AI OUTPUT =====\n");

      expect(ai.title.length).toBeGreaterThan(0);
      expect(ai.title.length).toBeLessThanOrEqual(120);
      expect(ai.doc.type).toBe("doc");
      expect(ai.doc.content.length).toBeGreaterThan(2);

      const titleLow = ai.title.toLowerCase();
      const bannedOpeners = [
        "learn how to",
        "discover",
        "a complete guide to",
        "everything you need to know",
      ];
      for (const phrase of bannedOpeners) {
        expect(titleLow.startsWith(phrase)).toBe(false);
      }

      // First block must be a heading at level 2 (title is rendered as H1
      // by the page; body opens at H2).
      const first = ai.doc.content[0] as
        | { type: string; attrs?: { level?: number } }
        | undefined;
      expect(first?.type).toBe("heading");
      expect(first?.attrs?.level).toBe(2);

      // Heading levels at the document root must not skip and must not go
      // back up out of order: each step is ±1 or stay.
      const rootHeadingLevels = (
        ai.doc.content as Array<{ type: string; attrs?: { level?: number } }>
      )
        .filter((b) => b.type === "heading")
        .map((b) => b.attrs?.level ?? 0);
      for (let i = 1; i < rootHeadingLevels.length; i++) {
        const prev = rootHeadingLevels[i - 1] ?? 0;
        const curr = rootHeadingLevels[i] ?? 0;
        // Allowed: same level, or one deeper, or back to any shallower level.
        expect(curr - prev).toBeLessThanOrEqual(1);
      }

      // No two consecutive root-level headings (every heading must be
      // followed by body content before the next heading).
      const rootTypes = (
        ai.doc.content as Array<{ type: string }>
      ).map((b) => b.type);
      for (let i = 1; i < rootTypes.length; i++) {
        if (rootTypes[i] === "heading") {
          expect(rootTypes[i - 1]).not.toBe("heading");
        }
      }

      // Headings should not appear inside blockquotes, callouts, or list items.
      const containsHeading = (b: Block): boolean => {
        if (!Array.isArray(b.content)) return false;
        for (const child of b.content) {
          if ((child as Block).type === "heading") return true;
          if (containsHeading(child as Block)) return true;
        }
        return false;
      };
      for (const block of ai.doc.content as Block[]) {
        if (
          block.type === "blockquote" ||
          block.type === "callout" ||
          block.type === "bulletList" ||
          block.type === "orderedList"
        ) {
          expect(containsHeading(block)).toBe(false);
        }
      }

      const seenBlockTypes = new Set<string>();
      walkBlocks(ai.doc.content as Block[], (b) => {
        seenBlockTypes.add(b.type);
        expect(FORBIDDEN_BLOCK_TYPES.has(b.type)).toBe(false);
      });
      // Sanity: at least one paragraph (already guaranteed by hierarchy rule
      // since each heading must be followed by body content).
      expect(seenBlockTypes.has("paragraph")).toBe(true);

      walkInlines(ai.doc.content as Block[], (node) => {
        expect(FORBIDDEN_INLINE_TYPES.has(node.type)).toBe(false);
        for (const mark of node.marks ?? []) {
          expect(FORBIDDEN_MARK_TYPES.has(mark.type)).toBe(false);
        }
      });

      const finalized = finalizeAiDoc(ai.doc);
      expect(finalized.type).toBe("doc");
      expect(finalized.content.length).toBe(ai.doc.content.length);

      // Every heading in the finalized doc has an id (required by DocContent).
      walkBlocks(finalized.content as Block[], (b) => {
        if (b.type === "heading") {
          const id = (b as { attrs?: { id?: string } }).attrs?.id;
          expect(id && id.length > 0).toBe(true);
        }
        if (b.type === "callout") {
          const hexId = (b as { attrs?: { hexId?: string } }).attrs?.hexId;
          expect(hexId && /^[0-9a-f]{8}$/.test(hexId)).toBe(true);
        }
      });
    },
    180_000,
  );
});

describe.skipIf(RUN)("generateBlogDraftContent — skipped without auth token", () => {
  it("is skipped because ANTHROPIC_AUTH_TOKEN is unset", () => {
    // This stub exists so the test file always reports at least one test
    // outcome (passed/skipped) instead of "no tests in file".
    expect(true).toBe(true);
  });
});
