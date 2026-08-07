import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { McpServer } from "@modelcontextprotocol/server";
import {
  ANALYTICS_TABLE,
  COLUMNS,
  BOT_CATEGORY_NAMES,
  EXTRA_DATA_MAX_PROPERTIES,
  EXTRA_DATA_MAX_KEY_LENGTH,
  EXTRA_DATA_MAX_VALUE_LENGTH,
} from "@tabsircg/schemas/analytics";
import { Collections } from "@/config/firebaseAdmin";
import { readWebsiteConfig } from "@/lib/analyticsWebsites";
import { REVENUE_KINDS } from "@/lib/analyticsQuery";

const COLUMN_NOTES: Partial<Record<keyof typeof COLUMNS, string>> = {
  websiteId: "Always filter on this. One row set per registered site.",
  type: "pageview | external_link | identify | payment, or a custom event type",
  href: "Full URL of the page. Use path extraction for grouping.",
  eventName: "Set for custom and payment events; empty for pageviews.",
  extraData: "JSON string. Read with JSONExtractString(extra_data, 'key').",
  isBot: "0 for humans, 1 for crawlers. Filter to 0 unless you want bots.",
  botCategory: BOT_CATEGORY_NAMES.join(" | "),
  revenueCents: "Integer cents, payment events only. Divide by 100.",
  sessionNumber: "1 means a first-time visitor; >1 means returning.",
  timestamp: "Unix epoch milliseconds.",
};

function analyticsSchemaDoc(): string {
  const rows = Object.entries(COLUMNS).map(([key, column]) => {
    const note = COLUMN_NOTES[key as keyof typeof COLUMNS] ?? "";
    return `| ${column} | ${note} |`;
  });

  return [
    `# ${ANALYTICS_TABLE}`,
    "",
    "The single Tinybird table behind every analytics query. ClickHouse SQL dialect.",
    "",
    "## Columns",
    "",
    "| column | notes |",
    "| --- | --- |",
    ...rows,
    "",
    "## Event types",
    "",
    "- `pageview` — one row per page view. Sessions are derived by grouping on `session_id`.",
    "- `external_link` — a click on an outbound link; `href` is the destination.",
    "- `identify` — a visitor tying themselves to an account.",
    "  `JSONExtractString(extra_data, 'user_id')` is always present and non-empty.",
    "- `payment` — a Stripe event. `revenue_cents` carries the amount and",
    `  \`JSONExtractString(extra_data, 'kind')\` is one of ${REVENUE_KINDS.map((k) => `\`${k}\``).join(", ")}.`,
    "- any other `type` value — a `trackEvent` call. The tracker forbids reusing",
    "  `pageview`, `payment` or `identify` as a custom type. `event_name` carries",
    "  the name and `extra_data` the properties.",
    "",
    "## Revenue model",
    "",
    "Revenue is never a single number. `charge` is money in; `refund` and `dispute`",
    "are money out and are stored as separate positive rows. Net revenue is",
    "`charge - refund - dispute`. A query that sums `revenue_cents` without",
    "splitting on `kind` overstates income.",
    "",
    "## extra_data rules",
    "",
    `- At most ${EXTRA_DATA_MAX_PROPERTIES} properties, keys up to ${EXTRA_DATA_MAX_KEY_LENGTH} chars matching \`[a-z0-9_-]+\`.`,
    `- Values are strings, up to ${EXTRA_DATA_MAX_VALUE_LENGTH} chars.`,
    "",
    "## Query conventions",
    "",
    "```sql",
    `SELECT count() FROM ${ANALYTICS_TABLE}`,
    "WHERE website_id = '<id>'",
    "  AND is_bot = 0",
    "  AND type = 'pageview'",
    "  AND timestamp >= <startMs> AND timestamp < <endMs>",
    "```",
  ].join("\n");
}

function firestoreSchemaDoc(): string {
  const notes: Record<string, string> = {
    DASHBOARD_STATS: "Aggregated dashboard stats. Doc: `dashboard`.",
    DAILY_STATS: "Per-day buckets, doc ids like `2026-05-08`.",
    MONTHLY_STATS: "Per-month buckets, doc ids like `2026-05`.",
    PAGE_METRICS: "Per-page traffic metrics, doc ids are page slugs.",
    BLOGS:
      "Blog posts and drafts, doc ids are uuids. `content` is a JSON string, not an object. Drafts carry `parentBlogId` pointing at the published post they edit.",
    EVENTS: "Legacy event log.",
    VALID_LINKS:
      "Published slugs for sitemap and link validation. Doc: `blogs`.",
    CONFIG:
      "App config edited from the CMS. Docs: `blog` (taxonomy), `site`, `portfolio`, `analytics` (registered websites).",
    FUNNELS: "Funnel definitions, doc ids are funnel ids.",
  };

  return [
    "# Firestore collections",
    "",
    "| key | collection | contents |",
    "| --- | --- | --- |",
    ...Object.entries(Collections).map(
      ([key, name]) => `| ${key} | \`${name}\` | ${notes[key] ?? ""} |`,
    ),
    "",
    "## Blog status model",
    "",
    "`status` is one of `published`, `unpublished`, `archived`, `draft`.",
    "Editing a published post creates a *separate* draft doc with",
    "`parentBlogId` set; publishing merges it back and deletes the draft.",
    "Never edit a published doc directly — go through blog_update_draft.",
    "",
    "## Featured post",
    "",
    "`featuredAt` is a nullable timestamp, not a boolean. The published post",
    "with the highest non-null `featuredAt` is the featured one. There is no",
    "unfeature operation by design.",
  ].join("\n");
}

async function sitesDoc(): Promise<string> {
  const { websites } = await readWebsiteConfig();
  if (websites.length === 0) return "No analytics websites are registered.";

  return [
    "# Registered analytics websites",
    "",
    ...websites.flatMap((site) => [
      `## ${site.name}`,
      `- id: \`${site.id}\``,
      `- origins: ${site.origins.join(", ")}`,
      `- stripe revenue: ${site.stripe?.configured ? "configured" : "not configured"}`,
      "",
    ]),
  ].join("\n");
}

export function registerResources(server: McpServer) {
  server.registerResource(
    "analytics-schema",
    "analytics://schema/events",
    {
      title: "analytics_events table contract",
      description:
        "Columns, event types, the revenue split model and query conventions for the Tinybird analytics table. Read before writing analytics_query SQL.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: analyticsSchemaDoc(),
        },
      ],
    }),
  );

  server.registerResource(
    "firestore-schema",
    "admin://schema/firestore",
    {
      title: "Firestore collections and the blog model",
      description:
        "What lives in each Firestore collection, plus the draft/published and featured-post rules that the blog tools enforce.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: firestoreSchemaDoc(),
        },
      ],
    }),
  );

  server.registerResource(
    "websites",
    "admin://sites",
    {
      title: "Registered analytics websites",
      description:
        "Live list of tracked sites with their ids, for the websiteId argument on the analytics tools.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        { uri: uri.href, mimeType: "text/markdown", text: await sitesDoc() },
      ],
    }),
  );

  server.registerResource(
    "analytics-guide",
    "admin://guide/analytics",
    {
      title: "Analytics design notes",
      description:
        "The repo's own ANALYTICS.md: what a session is here, how revenue is attributed to visitors, and how goals and funnels are modelled.",
      mimeType: "text/markdown",
    },
    async (uri) => {
      const file = path.join(process.cwd(), "ANALYTICS.md");
      const text = await readFile(file, "utf8").catch(
        () => "ANALYTICS.md was not found next to the running admin app.",
      );
      return {
        contents: [{ uri: uri.href, mimeType: "text/markdown", text }],
      };
    },
  );
}
