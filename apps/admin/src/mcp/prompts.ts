import "server-only";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";

function userMessage(text: string) {
  return {
    messages: [
      { role: "user" as const, content: { type: "text" as const, text } },
    ],
  };
}

export function registerPrompts(server: McpServer) {
  server.registerPrompt(
    "weekly-report",
    {
      title: "Weekly traffic and revenue report",
      description:
        "Pull the last 7 days against the previous 7 and write a short report: what moved, which pages and sources drove it, and what is worth acting on.",
      argsSchema: z.object({
        websiteId: z
          .string()
          .optional()
          .describe("Leave empty when only one site is registered."),
      }),
    },
    ({ websiteId }) =>
      userMessage(
        [
          "Write my weekly analytics report.",
          "",
          "1. Call analytics_overview for last7d" +
            (websiteId ? ` on website ${websiteId}` : "") +
            " to get the headline numbers and period-over-period change.",
          "2. Read analytics://schema/events, then use analytics_query for:",
          "   - top 10 pages by unique visitors, with their change vs the prior 7 days",
          "   - top referrers and channels",
          "   - any custom events that spiked or vanished",
          "3. If revenue moved, break it into charge, refund and dispute rather than",
          "   reporting a single net figure, and say which pages the paying visitors saw.",
          "",
          "Keep it under 400 words. Lead with the single most important change.",
          "Flag anything that looks like a tracking bug rather than a real change.",
          "Do not pad the report with metrics that did not move.",
        ].join("\n"),
      ),
  );

  server.registerPrompt(
    "traffic-anomaly",
    {
      title: "Investigate a traffic anomaly",
      description:
        "Given something that looks off — a spike, a drop, a weird source — dig through the event data and produce a likely cause.",
      argsSchema: z.object({
        observation: z
          .string()
          .describe("What looks wrong, e.g. 'visitors doubled on Tuesday'."),
        websiteId: z.string().optional(),
      }),
    },
    ({ observation, websiteId }) =>
      userMessage(
        [
          `Investigate this: ${observation}`,
          websiteId ? `Website: ${websiteId}` : "",
          "",
          "Read analytics://schema/events first. Then work the problem:",
          "- Isolate the window where the change happens, at hourly granularity.",
          "- Split it by source, page, country, device and bot flag to find what is",
          "  concentrated in the anomalous window and not elsewhere.",
          "- Check is_bot = 1 separately. A crawler wave is the most common cause of",
          "  a spike that does not convert.",
          "- Compare session_number to see whether it is new or returning traffic.",
          "",
          "Give me the most likely explanation with the query results that support it.",
          "If the data does not distinguish between two causes, say so and name the",
          "query or instrumentation that would.",
        ]
          .filter(Boolean)
          .join("\n"),
      ),
  );

  server.registerPrompt(
    "draft-post",
    {
      title: "Draft a blog post",
      description:
        "Turn notes or a topic into a draft in the CMS, using the existing taxonomy and matching the voice of what is already published.",
      argsSchema: z.object({
        topic: z.string().describe("The topic or raw notes to work from."),
      }),
    },
    ({ topic }) =>
      userMessage(
        [
          `Draft a blog post about: ${topic}`,
          "",
          "Before writing:",
          "- Call config_read for the existing tags and kinds. Reuse them; only",
          "  suggest a new tag if nothing fits, and ask before adding it.",
          "- Call blog_list and blog_get on one or two recent posts to match voice,",
          "  structure and typical length. Do not invent a house style.",
          "",
          "Then call blog_create_draft with the body and metadata filled in.",
          "Leave it as a draft — do not call blog_publish. Report the blogId and a",
          "one-line summary of what you wrote so I can review it in the CMS.",
        ].join("\n"),
      ),
  );
}
