"use server";
import Anthropic from "@anthropic-ai/sdk";
import type { ToolUnion } from "@anthropic-ai/sdk/resources/messages/messages";
import { docToText } from "@open-notion/editor";
import { z } from "zod";
import { aiBlogMetadataSchema } from "@tabsircg/schemas/ai";
import { docContentSchema } from "@tabsircg/schemas/blog";
import { wrap } from "@/lib/appUtils";
import { requireAuth } from "@/lib/requireAuth";
import { readTags } from "@/actions/tagActions";

const client = new Anthropic();

const METADATA_TOOL_INPUT_SCHEMA = z.toJSONSchema(aiBlogMetadataSchema, {
  target: "draft-7",
});

const generateInputSchema = z.object({
  content: docContentSchema,
  title: z.string().optional(),
  kind: z.string().optional(),
  currentTags: z.array(z.string()).default([]),
});

const SYSTEM_PROMPT = `You are a senior content/SEO editor for a software-engineering blog. Your job is to read a blog draft and produce concise, high-quality SEO metadata that fits the post's voice.

Rules:
- Honor the per-field character limits exactly (the tool's input_schema enforces them).
- Match the existing dek/title voice if provided; otherwise infer from the content.
- Tags MUST be a strict subset of the provided whitelist. Never invent tags.
- Use the web_search tool only when the topic is time-sensitive or trend-dependent (e.g. recently released tools, evolving best practices). Skip it for evergreen topics.
- Call submit_metadata exactly once, after any research is complete.`;

const buildUserPrompt = ({
  plaintext,
  title,
  kind,
  currentTags,
  allTags,
}: {
  plaintext: string;
  title?: string;
  kind?: string;
  currentTags: string[];
  allTags: string[];
}) => {
  const lines: string[] = [];
  if (title) lines.push(`Existing title (preserve voice): ${title}`);
  if (kind) lines.push(`Post kind: ${kind}`);
  if (currentTags.length) lines.push(`Current tags: ${currentTags.join(", ")}`);
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
    "Produce SEO-optimized metadata via the submit_metadata tool. Do not output any other text.",
  );
  return lines.join("\n");
};

export const generateBlogMetadata = wrap(async (rawJson: string) => {
  await requireAuth();
  const parsedInput = generateInputSchema.parse(JSON.parse(rawJson));
  const { content, title, kind, currentTags } = parsedInput;

  const [plaintext, allTags] = await Promise.all([
    docToText(content),
    readTags(),
  ]);

  if (!plaintext.trim()) {
    throw new Error("Write some content before generating metadata.");
  }

  const tools: ToolUnion[] = [
    { type: "web_search_20260209", name: "web_search", max_uses: 5 },
    {
      name: "submit_metadata",
      description:
        "Submit the final SEO-optimized metadata. Call exactly once after research is complete.",
      input_schema: METADATA_TOOL_INPUT_SCHEMA as Anthropic.Tool.InputSchema,
    },
  ];

  const resp = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 2048,
    tools,
    tool_choice: { type: "auto" },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildUserPrompt({
          plaintext,
          ...(title ? { title } : {}),
          ...(kind ? { kind } : {}),
          currentTags,
          allTags,
        }),
      },
    ],
  });

  const toolUse = resp.content.find(
    (b) => b.type === "tool_use" && b.name === "submit_metadata",
  );
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Model did not return structured metadata.");
  }

  const parsed = aiBlogMetadataSchema.parse(toolUse.input);
  if (allTags.length) {
    const allowed = new Set(allTags);
    parsed.tags = parsed.tags.filter((t) => allowed.has(t));
  }
  return parsed;
});
