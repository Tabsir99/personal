"use server";
import { sendPrompt } from "@/config/anthropic";
import { docToText } from "@open-notion/editor";
import { z } from "zod";
import { aiBlogMetadataSchema } from "@tabsircg/schemas/ai";
import { docContentSchema } from "@tabsircg/schemas/blog";
import { wrap } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { readConfigField } from "@/actions/configActions";

const generateInputSchema = z.object({
  content: docContentSchema,
  kind: z.string().optional(),
});

const SYSTEM_PROMPT = `# Role

You are a senior content/SEO editor for an opinionated, voice-driven personal blog (often software-engineering, but also essays, war-stories, and field notes on whatever the author finds interesting). Produce metadata that drives click-through while preserving the author's voice.

# Voice rules (General)

1. **Match grammatical person.** First-person draft → first-person copy where possible.

2. **Match casing convention.** Sentence-case draft → sentence-case metadata. Do not silently title-case.

3. **Never invent a stance not in the draft.** Contradicting your own article in the meta is the single most damaging SEO error.

# Field guide

## title (≤120 chars)
Page H1 / browser tab. The truest readable version of the post.

## dek (≤200 chars)
Magazine bridge between headline and body. Promise something concrete a reader can decide on in 2 seconds. Avoid restating the title.

## excerpt (≤280 chars)
Blog listing card copy. More complete than dek — include at least one specific detail (a number, a tool, an outcome).

## seoTitle (≤60 chars)
HTML \`<title>\`. Lead with the primary keyword. A hook beats a brand label almost always.

## metaDescription (≤160 chars)
\`<meta name="description">\`. Answer the searcher's implicit question with specifics. Never open with "Learn how to…", "Discover…", "A complete guide to…" — they signal low-effort content.

## socialTitle (≤70 chars)
\`og:title\`. Optimize for emotional click-through — hook, surprise, or a specific number. Should differ from seoTitle in framing.

## socialDescription (≤200 chars)
\`og:description\`. Land the socialTitle hook with one concrete detail that makes a scrolling reader stop.

## tags (≤5, strict subset of allowed list)
Pick signal tags only — a reader filtering by this tag would genuinely want THIS post. 1–3 well-chosen tags beats 5 loose ones. Never invent tags outside the whitelist.

# Anti-patterns

- Generic openers: "Learn how to…", "Discover…", "Everything you need to know…", "A complete guide to…"
- Title-casing fields when the draft uses sentence case
- Repeating the title verbatim in the dek
- Same wording across seoTitle, socialTitle, and dek (each has a different job)
- Sanitizing emotional language from the draft
- Adding "Tips and tricks" / "Best practices" framing when the post isn't a list
- Inventing a stance not present in the draft`;

const buildUserPrompt = ({
  plaintext,
  kind,
  allTags,
}: {
  plaintext: string;
  kind?: string;
  allTags: string[];
}) => {
  const lines: string[] = [];
  if (kind) lines.push(`Post kind: ${kind}`);
  lines.push(
    allTags.length
      ? `Allowed tag whitelist (pick up to 5; subset only): ${allTags.join(", ")}`
      : `No tag whitelist available — pick up to 5 short, relevant tags.`,
  );
  lines.push("");
  lines.push("Blog draft (plain text):");
  lines.push("---");
  lines.push(plaintext.slice(0, 60_000));
  lines.push("---");
  lines.push(
    "Think through the post carefully, then produce the metadata JSON.",
  );
  return lines.join("\n");
};

export const generateBlogMetadata = wrap(async (rawJson: string) => {
  await requireAuth();

  const parsedInput = generateInputSchema.parse(JSON.parse(rawJson));
  const { content, kind } = parsedInput;

  const [plaintext, allTags] = await Promise.all([
    docToText(content),
    readConfigField("tags"),
  ]);

  if (!plaintext.trim()) {
    throw new Error("Write some content before generating metadata.");
  }

  const parsed = await sendPrompt(
    buildUserPrompt({
      plaintext,
      ...(kind ? { kind } : {}),
      allTags,
    }),
    { schema: aiBlogMetadataSchema, systemPrompt: SYSTEM_PROMPT },
  );

  if (allTags.length) {
    const allowed = new Set(allTags);
    parsed.tags = parsed.tags.filter((t) => allowed.has(t));
  }
  return parsed;
});
