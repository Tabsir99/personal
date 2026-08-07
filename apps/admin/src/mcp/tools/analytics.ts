import "server-only";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import {
  queryTinybird,
  periodToRange,
  previousPeriodRange,
  F,
} from "@/lib/tinybird";
import {
  eventWhere,
  revenueSplit,
  PAYMENT_KIND,
  type RevenueColumns,
} from "@/lib/analyticsQuery";
import { listFunnels } from "@/actions/funnelActions";
import { readWebsiteConfig } from "@/lib/analyticsWebsites";
import type { Period } from "@/lib/analyticsTypes";
import { guardReadOnlySql, DEFAULT_ROW_LIMIT } from "../sql";
import { guarded, table, money, percent, delta } from "../result";
import { resolveWebsiteId } from "../websites";

const periodSchema = z
  .union([
    z.enum(["today", "yesterday", "last7d", "last30d", "last90d"]),
    z.string().regex(/^custom:\d{4}-\d{2}-\d{2}:\d{4}-\d{2}-\d{2}$/),
  ])
  .default("last30d")
  .describe(
    "Preset window or custom:YYYY-MM-DD:YYYY-MM-DD. Defaults to last30d.",
  );

const websiteIdSchema = z
  .string()
  .optional()
  .describe(
    "Website id or name. Optional when exactly one website is registered.",
  );

interface OverviewRow extends RevenueColumns {
  kind: "traffic" | "revenue";
  period: "current" | "previous";
  visitors: number;
  newVisitors: number;
  pageviews: number;
  sessions: number;
  bounces: number;
  totalDuration: number;
  payingVisitors: number;
}

function overviewSql(
  websiteId: string,
  start: number,
  prevStart: number,
  end: number,
): string {
  const traffic = `
    SELECT
      'traffic' AS kind,
      period,
      uniqExact(vid) AS visitors,
      uniqExactIf(vid, snum = 1) AS newVisitors,
      sum(pvs) AS pageviews,
      count() AS sessions,
      countIf(pvs = 1) AS bounces,
      sum(durMs) AS totalDuration,
      toUInt64(0) AS payingVisitors,
      toFloat64(0) AS revCharge,
      toFloat64(0) AS revRefund,
      toFloat64(0) AS revDispute
    FROM (
      SELECT
        ${F.sessionId} AS sid,
        any(${F.visitorId}) AS vid,
        any(${F.sessionNumber}) AS snum,
        min(${F.timestamp}) AS startTs,
        max(${F.timestamp}) - min(${F.timestamp}) AS durMs,
        count() AS pvs,
        if(min(${F.timestamp}) >= ${start}, 'current', 'previous') AS period
      FROM ${F.engine}
      WHERE ${eventWhere("pageview", websiteId, prevStart, end)}
      GROUP BY sid
    )
    GROUP BY period`;

  const revenue = `
    SELECT
      'revenue' AS kind,
      period,
      0 AS visitors, 0 AS newVisitors, 0 AS pageviews,
      0 AS sessions, 0 AS bounces, 0 AS totalDuration,
      uniqExactIf(vid, paymentKind = 'charge') AS payingVisitors,
      sumIf(rev, paymentKind = 'charge') / 100 AS revCharge,
      sumIf(rev, paymentKind = 'refund') / 100 AS revRefund,
      sumIf(rev, paymentKind = 'dispute') / 100 AS revDispute
    FROM (
      SELECT
        ${F.visitorId} AS vid,
        ${F.revenueCents} AS rev,
        ${PAYMENT_KIND} AS paymentKind,
        if(${F.timestamp} >= ${start}, 'current', 'previous') AS period
      FROM ${F.engine}
      WHERE ${eventWhere("payment", websiteId, prevStart, end)}
    )
    GROUP BY period`;

  return `${traffic}\n    UNION ALL${revenue}`;
}

function summarise(rows: OverviewRow[], period: "current" | "previous") {
  const traffic = rows.find((r) => r.kind === "traffic" && r.period === period);
  const revenue = rows.find((r) => r.kind === "revenue" && r.period === period);

  const sessions = Number(traffic?.sessions ?? 0);
  const visitors = Number(traffic?.visitors ?? 0);
  const split = revenueSplit(revenue);

  return {
    visitors,
    newVisitors: Number(traffic?.newVisitors ?? 0),
    pageviews: Number(traffic?.pageviews ?? 0),
    sessions,
    bounceRate: sessions > 0 ? Number(traffic?.bounces ?? 0) / sessions : 0,
    sessionDuration:
      sessions > 0
        ? Math.round(Number(traffic?.totalDuration ?? 0) / sessions / 1000)
        : 0,
    payingVisitors: Number(revenue?.payingVisitors ?? 0),
    conversionRate:
      visitors > 0 ? Number(revenue?.payingVisitors ?? 0) / visitors : 0,
    net: split.charge - split.refund - split.dispute,
    ...split,
  };
}

export function registerAnalyticsTools(server: McpServer) {
  server.registerTool(
    "analytics_overview",
    {
      title: "Traffic and revenue overview",
      description:
        "Headline metrics for a period with period-over-period change: visitors, new vs returning, pageviews, sessions, bounce rate, session duration, and revenue split into charge/refund/dispute plus net. Start here before reaching for analytics_query.",
      inputSchema: z.object({
        websiteId: websiteIdSchema,
        period: periodSchema,
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ websiteId, period }) =>
      guarded(async () => {
        const site = await resolveWebsiteId(websiteId);
        const { start, end } = periodToRange(period as Period);
        const previous = previousPeriodRange(start, end);

        const result = await queryTinybird<OverviewRow>(
          overviewSql(site, start, previous.start, end),
          "mcp-overview",
        );

        const now = summarise(result.data, "current");
        const before = summarise(result.data, "previous");

        return [
          `Period: ${period} (vs previous ${period})`,
          "",
          `Visitors          ${now.visitors} (${delta(now.visitors, before.visitors)})`,
          `  new             ${now.newVisitors}`,
          `  returning       ${now.visitors - now.newVisitors}`,
          `Pageviews         ${now.pageviews} (${delta(now.pageviews, before.pageviews)})`,
          `Sessions          ${now.sessions} (${delta(now.sessions, before.sessions)})`,
          `Bounce rate       ${percent(now.bounceRate)} (was ${percent(before.bounceRate)})`,
          `Avg session       ${now.sessionDuration}s (was ${before.sessionDuration}s)`,
          "",
          `Charged           ${money(now.charge)} (${delta(now.charge, before.charge)})`,
          `Refunded          ${money(now.refund)}`,
          `Disputed          ${money(now.dispute)}`,
          `Net revenue       ${money(now.net)} (${delta(now.net, before.net)})`,
          `Paying visitors   ${now.payingVisitors}`,
          `Conversion rate   ${percent(now.conversionRate)} (was ${percent(before.conversionRate)})`,
        ].join("\n");
      }),
  );

  server.registerTool(
    "analytics_query",
    {
      title: "Run a read-only analytics query",
      description:
        "Run SELECT SQL (ClickHouse dialect) against the analytics_events table in Tinybird. Read the analytics://schema/events resource first for column names, event types and the extra_data conventions. Only SELECT/WITH is accepted; a LIMIT is applied when you omit one. Use this for anything analytics_overview does not answer.",
      inputSchema: z.object({
        sql: z
          .string()
          .min(1)
          .describe(
            "A single SELECT or WITH statement. Filter on website_id and is_bot = 0 unless you specifically want crawler traffic.",
          ),
        rowLimit: z
          .number()
          .int()
          .positive()
          .max(1000)
          .default(DEFAULT_ROW_LIMIT)
          .describe("Applied only when the query has no LIMIT of its own."),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ sql, rowLimit }) =>
      guarded(async () => {
        const safe = guardReadOnlySql(sql, rowLimit);
        const result = await queryTinybird<Record<string, unknown>>(
          safe,
          "mcp-query",
        );
        return [
          table(result.data, rowLimit),
          "",
          `${result.rows} row(s).`,
        ].join("\n");
      }),
  );

  server.registerTool(
    "analytics_list_websites",
    {
      title: "List registered analytics websites",
      description:
        "The websites this admin tracks: id, name, allowed origins, and whether Stripe revenue attribution is configured. Use the id for the websiteId argument on other tools.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () =>
      guarded(async () => {
        const { websites } = await readWebsiteConfig();
        return table(
          websites.map((site) => ({
            id: site.id,
            name: site.name,
            origins: site.origins.join(", "),
            stripe: site.stripe?.configured ? "configured" : "no",
            createdAt: new Date(site.createdAt).toISOString().slice(0, 10),
          })),
        );
      }),
  );

  server.registerTool(
    "analytics_list_funnels",
    {
      title: "List funnel definitions",
      description:
        "Funnels defined for a website, with their steps in order. Returns the funnel id and slug needed to look one up.",
      inputSchema: z.object({ websiteId: websiteIdSchema }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ websiteId }) =>
      guarded(async () => {
        const site = await resolveWebsiteId(websiteId);
        const funnels = await listFunnels(site);
        if (funnels.length === 0) return "No funnels defined.";
        return funnels
          .map((funnel) => {
            const steps = funnel.steps
              .map(
                (step, index) =>
                  `  ${index + 1}. ${step.name} — ${
                    step.type === "pageview"
                      ? `pageview ${step.urlMatchType} ${step.url}`
                      : `goal ${step.goalName}`
                  }`,
              )
              .join("\n");
            return `${funnel.name} (${funnel.slug}, id ${funnel.id})${
              funnel.isActive ? "" : " [inactive]"
            }\n${steps}`;
          })
          .join("\n\n");
      }),
  );
}
