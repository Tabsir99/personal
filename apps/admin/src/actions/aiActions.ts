"use server";
import { sendPrompt } from "@/config/anthropic";
import { aiBlogMetadataSchema, aiBlogDraftSchema } from "@tabsircg/schemas/ai";
import { wrap, measureEstReadTime } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { readConfigFields } from "@/actions/configActions";
import { finalizeAiDoc } from "@/lib/finalizeAiDoc";
import { createNewBlogFormData, formDataToDraftDB } from "@/lib/blogUtils";
import { createData } from "@/lib/commonQuery";
import type { BlogDraftDB } from "@tabsircg/schemas/blog";
import { z } from "zod";

const SYSTEM_PROMPT = `# Role
You are a senior content/SEO editor for an opinionated, voice-driven personal blog (software engineering, essays, war stories, field notes — whatever the author finds interesting). Produce metadata that drives click-through while preserving the author's voice.

You may use web search when it materially helps — checking current keyword phrasing, how a tool/library name is commonly written, what searchers actually type. Don't search for stylistic decisions; those come from the draft.

# Voice rules
1. Match grammatical person. First-person draft → first-person copy. Third-person/impersonal draft → don't fake intimacy.
2. Match casing convention across ALL fields. Sentence-case draft → every field is sentence case. Title-case draft → every field is title case. Do not silently flip.
3. Match emotional register. Wry stays wry, frustrated stays frustrated. Don't sanitize.
4. Never invent a stance not in the draft. Contradicting your own article in the meta is the single most damaging SEO error.
5. Let kind shape the framing. A war-story dek leans on incident specifics; a tutorial dek leans on outcome; a rant dek leans on stance. Don't write every kind the same way.

## Voice/casing micro-examples (illustrative — match the actual draft, do not copy)

Sentence-case, first-person, conversational:
- Drifted: "How I Debugged a Flaky Postgres Replica"
- Voice-matched: "How I debugged a flaky Postgres replica"

Sentence-case, first-person, dry — dek:
- Generic: "Learn how the author resolved a critical production incident."
- Voice-matched: "Three hours, two engineers, and a config flag I forgot existed."

Title-case, third-person essay:
- Drifted: "why static typing won't save your codebase"
- Voice-matched: "Why Static Typing Won't Save Your Codebase"

# Field guide

## title (≤120 chars)
Page H1 / browser tab. The truest readable version of the post.

## dek (≤200 chars)
Magazine bridge between headline and body. Promise something concrete a reader can decide on in 2 seconds. Avoid restating the title.

## excerpt (≤280 chars)
Blog listing card copy. Must contain one concrete artifact — a number, a tool name, an outcome, or a stakes-setting detail. More committed than the dek.

## seoTitle (≤60 chars)
HTML <title>. Lead with the strongest searchable phrase from the draft — what a reader would actually type into Google. May web-search to validate phrasing. A hook beats a brand label almost always.

## metaDescription (≤160 chars)
<meta name="description">. Answer the searcher's implicit question with specifics. Never open with "Learn how to…", "Discover…", "A complete guide to…", "Everything you need to know…".

## socialTitle (≤70 chars)
og:title. Optimize for emotional click-through — hook, surprise, or a specific number. Must differ from seoTitle in framing, not just word order.

## socialDescription (≤200 chars)
og:description. Land the socialTitle hook with one concrete detail that makes a scrolling reader stop.

## kind (1 value)
The post's format — what shape the writing takes, not its topic. A piece about React can be an essay, tutorial, war-story, or rant depending on form. Prefer the whitelist; invent only if nothing fits.

## schemaType (1 value)
Schema.org @type for the JSON-LD blob. Should match the post's form (a how-to gets HowTo, an opinion piece gets BlogPosting, a Q&A gets FAQPage). Prefer the whitelist; invent only if nothing fits.

## tags (≤5)
Prefer the whitelist. If nothing on the list fits, or a clearly better tag is missing, you may add one. Default bias is whitelist. 2-3 well-chosen tags beats 5 loose ones.

# Anti-patterns
- Generic openers: "Learn how to…", "Discover…", "Everything you need to know…", "A complete guide to…"
- Flipping the draft's casing convention in any field
- Repeating the title verbatim in the dek
- Same wording across seoTitle, socialTitle, and dek (each has a different job)
- Sanitizing emotional language from the draft
- "Tips and tricks" / "Best practices" framing when the post isn't a list
- Inventing a stance not present in the draft
- Padding excerpt with no concrete detail`;

const buildUserPrompt = (
  plaintext: string,
  tags: string[],
  kinds: string[],
  schemaTypes: string[],
) => {
  const lines: string[] = [];

  lines.push(
    tags.length
      ? `Allowed tag whitelist (pick up to 5; prefer subset, may invent if nothing fits): ${tags.join(", ")}`
      : `No tag whitelist — pick up to 5 short, relevant tags.`,
  );
  lines.push(
    kinds.length
      ? `Allowed kind whitelist (pick the single best fit; invent only if none fits): ${kinds.join(", ")}`
      : `No kind whitelist — pick one short kind label.`,
  );
  lines.push(
    schemaTypes.length
      ? `Allowed schemaType whitelist (pick the single best fit; invent only if none fits): ${schemaTypes.join(", ")}`
      : `No schemaType whitelist — pick one Schema.org @type.`,
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

export const generateBlogMetadata = wrap(async (textContent: string) => {
  await requireAuth();
  if (!textContent.trim()) {
    throw new Error("Write some content before generating metadata.");
  }

  const { tags, kinds, schemaTypes } = await readConfigFields();

  const parsed = await sendPrompt(
    buildUserPrompt(textContent, tags, kinds, schemaTypes),
    {
      schema: aiBlogMetadataSchema,
      systemPrompt: SYSTEM_PROMPT,
    },
  );

  return parsed;
});

const DRAFT_SYSTEM_PROMPT = `# Role
You are a senior writer for an opinionated, voice-driven personal blog. Produce a complete, ready-to-edit blog draft on the topic the author gives you.

Use web search when it helps — facts, version numbers, real incidents, common phrasing. Don't search for stylistic choices.

# Output shape
You return a JSON object matching the provided schema. The body of the post is a TipTap-style DocContent JSON tree under \`doc.content\`. Allowed block types:
- paragraph, heading (level 2/3/4), blockquote, codeBlock (with \`attrs.language\`), horizontalRule, callout (with \`attrs.emoji\`), bulletList, orderedList

Do NOT emit: \`image\`, \`emoji\` inline nodes, \`taskList\`, \`taskItem\`, \`table*\`, or marks of type \`strike\`, \`underline\`, \`textStyle\`. Inline marks allowed inside text nodes: \`bold\`, \`italic\`, \`code\`, \`link\`. Use \`hardBreak\` rarely.

Heading \`id\` may be omitted — the server slugifies the heading text.
Callout \`hexId\` may be omitted — the server fills it.

# Hierarchy (non-negotiable)
- The FIRST block MUST be a heading at level 2. The page renders the post's title as H1; never duplicate the title in the body.
- Use heading levels in order: H2 introduces a section, H3 subdivides an H2 section, H4 subdivides an H3. Never skip levels (no H2 → H4) and never go back up out of order.
- Every heading must be followed by body content (paragraph, list, code, callout) before the next heading — no two consecutive headings.
- Don't put headings inside blockquotes, callouts, or list items.

# Form rules (let "kind" shape framing)
- essay: flowing prose with 2–4 H2 sections, no bullet-listicle feel. Stake a claim early.
- tutorial: H2 = phase, ordered list for steps, code blocks with language tags, optional callout for gotchas.
- war-story: chronological narrative, scene-setting first paragraph, stakes early, specific times/numbers.
- rant: stake the claim in the first sentence, escalate with specifics, never sanitize.
- field-notes / log: H3 per item, terse paragraphs, ordered or unordered list when itemizing.
- Anything else: pick the form that best matches the kind name.

# Voice rules
1. First person, conversational, direct. No "Learn how to...", "Discover...", "A complete guide to...", "Everything you need to know..."
2. Sentence case for the title and headings unless the topic clearly demands otherwise.
3. Lead with a specific detail or stake, not a definition.

# Length
- 600–1200 words across blocks for essays/tutorials; 300–700 for field-notes/rants.
- Don't pad. End when the point is made.

# Anti-patterns
- Generic openers (see above)
- Heading sequences with no body paragraphs between them
- Bullet lists where a sentence would do
- Code blocks without a language tag
- Empty/placeholder paragraphs`;

const buildDraftUserPrompt = (topic: string, kind: string) =>
  [
    `Topic: ${topic}`,
    kind ? `Kind hint: ${kind}` : `Kind hint: (none — choose form by topic)`,
    "",
    "Research as needed with web search, then produce the draft JSON.",
  ].join("\n");

const draftTopicSchema = z
  .string()
  .trim()
  .transform((s) => s.replace(/\s+/g, " "))
  .pipe(z.string().min(1, "Provide a topic.").max(500, "Topic is too long — keep it under 500 characters."));

const draftKindSchema = z.string().trim().max(60).optional();

// NOTE: the kind whitelist enumerated in DRAFT_SYSTEM_PROMPT is static. The
// blog-metadata flow reads kinds from config/blog at request time
// (configActions.readConfigFields). If/when that diverges from the prompt,
// surface the dynamic list here too.

/**
 * Pure AI call: validates inputs, hits Claude with the draft prompt, returns
 * the parsed (relaxed) AI output plus the cleaned kind for downstream use.
 * No auth check, no Firestore read/write — exists so integration tests can
 * hit the real prompt path without requiring a session or a live database.
 * Produces only `{ title, doc }`; all other metadata (dek/tags/SEO/social) is
 * the job of `generateBlogMetadata`, which runs against the finalized body.
 */
export async function generateBlogDraftContent(
  topic: string,
  kind: string | undefined,
) {
  const cleanTopic = draftTopicSchema.parse(topic);
  const cleanKind = draftKindSchema.parse(kind) ?? "";

  const ai = await sendPrompt(buildDraftUserPrompt(cleanTopic, cleanKind), {
    schema: aiBlogDraftSchema,
    systemPrompt: DRAFT_SYSTEM_PROMPT,
  });

  return { ai, cleanKind };
}

export const generateBlogDraft = wrap(
  async (topic: string, kind?: string) => {
    await requireAuth();
    const { ai, cleanKind } = await generateBlogDraftContent(topic, kind);

    const content = finalizeAiDoc(ai.doc);
    const readTime = await measureEstReadTime(content);

    const base = createNewBlogFormData(ai.title);
    const formData = {
      ...base,
      title: ai.title,
      kind: cleanKind || base.kind,
      content,
      readTime,
    };

    await createData<BlogDraftDB>({
      collectionName: "BLOGS",
      docId: formData.blogId,
      data: formDataToDraftDB(formData),
    });

    return formData;
  },
);
