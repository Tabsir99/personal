import "server-only";
import type { AnalyticsEventRow } from "@tabsircg/schemas/analytics";
import { formatCountryName } from "@/lib/countryUtils";
import { parseHref } from "@/lib/tinybird";
import { CAMPAIGN_DIMENSIONS } from "@/lib/analyticsTypes";
import type {
  JourneyEntry,
  JourneyPageviewEntry,
  JourneyTrackingParam,
  JourneyVisitor,
} from "@/lib/analyticsTypes";

export const MAX_ROWS_PER_VISITOR = 100;

export const JOURNEY_COLUMNS = [
  "visitor_id",
  "timestamp",
  "type",
  "event_name",
  "href",
  "referrer",
  "domain",
  "extra_data",
  "revenue_cents",
  "country",
  "city",
  "browser",
  "os",
  "device",
  "viewport_w",
  "viewport_h",
] as const satisfies readonly (keyof AnalyticsEventRow)[];

type StoredColumns = Pick<AnalyticsEventRow, (typeof JOURNEY_COLUMNS)[number]>;

interface QueryComputedColumns {
  channel: string;
  goal_at: number;
}

export type JourneyRow = StoredColumns & QueryComputedColumns;

function parseExtra(raw: string): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function trackingParamsFrom(params: URLSearchParams): JourneyTrackingParam[] {
  const out: JourneyTrackingParam[] = [];
  for (const type of CAMPAIGN_DIMENSIONS) {
    const value = params.get(type);
    if (value) out.push({ type, value });
  }
  return out;
}

function attributionParams(params: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of CAMPAIGN_DIMENSIONS) out[key] = params.get(key) ?? "";
  return out;
}

function toEntry(row: JourneyRow, isGoal: boolean): JourneyEntry {
  if (row.type === "pageview") {
    return {
      timestamp: row.timestamp,
      eventType: "pageview",
      isGoal,
      data: { path: parseHref(row.href).path, hostname: row.domain, count: 1 },
      lastTimestamp: row.timestamp,
    };
  }

  if (row.type === "payment") {
    return {
      timestamp: row.timestamp,
      eventType: "payment",
      isGoal,
      data: { amount: row.revenue_cents / 100 },
    };
  }

  const extra = parseExtra(row.extra_data);
  delete extra.eventName;
  return {
    timestamp: row.timestamp,
    eventType: "custom",
    isGoal,
    data: { eventName: row.event_name, metadata: extra },
  };
}

function isPageview(entry: JourneyEntry): entry is JourneyPageviewEntry {
  return entry.eventType === "pageview";
}

function foldConsecutiveRepeatPageviews(
  entries: JourneyEntry[],
): JourneyEntry[] {
  const folded: JourneyEntry[] = [];

  for (const entry of entries) {
    const previous = folded[folded.length - 1];
    if (
      previous &&
      isPageview(previous) &&
      isPageview(entry) &&
      previous.data.path === entry.data.path
    ) {
      previous.data.count += 1;
      previous.lastTimestamp = entry.lastTimestamp;
      continue;
    }
    folded.push(entry);
  }

  return folded;
}

function exceedsRowCap(rows: JourneyRow[]): boolean {
  return rows.length > MAX_ROWS_PER_VISITOR;
}

function dropOverCapSentinel(rows: JourneyRow[]): JourneyRow[] {
  return exceedsRowCap(rows) ? rows.slice(1) : rows;
}

function hasBrowserDerivedFields(row: JourneyRow): boolean {
  return row.browser !== "" || row.country !== "";
}

function newestRowWithBrowserFields(rows: JourneyRow[]): JourneyRow {
  return [...rows].reverse().find(hasBrowserDerivedFields) ?? rows[0]!;
}

function newestRevenueRow(rows: JourneyRow[]): JourneyRow | undefined {
  return [...rows]
    .reverse()
    .find((r) => r.type === "payment" && r.revenue_cents > 0);
}

function synthesiseReferralEntry(entryRow: JourneyRow): JourneyEntry {
  return {
    timestamp: entryRow.timestamp,
    eventType: "referral",
    isGoal: false,
    data: {
      domainName: entryRow.domain,
      channel: entryRow.channel,
      fullReferrer: entryRow.referrer,
      trackingParams: trackingParamsFrom(parseHref(entryRow.href).params),
    },
  };
}

export function assembleVisitor(
  rowsIncludingSentinel: JourneyRow[],
  goalName: string | null,
): JourneyVisitor {
  const truncated = exceedsRowCap(rowsIncludingSentinel);
  const rows = dropOverCapSentinel(rowsIncludingSentinel);

  const entryRow = rows[0]!;
  const lastRow = rows[rows.length - 1]!;
  const profileRow = newestRowWithBrowserFields(rows);

  const goalCompletedAt = entryRow.goal_at || null;
  const goalRow = rows.find(
    (r) => r.timestamp === goalCompletedAt && r.event_name === goalName,
  );

  const identity = parseExtra(newestRevenueRow(rows)?.extra_data ?? "");
  const entryParams = parseHref(entryRow.href).params;

  return {
    completeJourney: [
      synthesiseReferralEntry(entryRow),
      ...foldConsecutiveRepeatPageviews(
        rows.map((row) => toEntry(row, row === goalRow)),
      ),
    ],
    truncated,
    visitorId: entryRow.visitor_id,
    customerName: str(identity.customer_name),
    customerEmail: str(identity.customer_email),
    profileMetadata: identity,
    amount: rows.reduce((sum, r) => sum + r.revenue_cents, 0) / 100,
    channel: entryRow.channel,
    sourceAttribution: {
      timestamp: entryRow.timestamp,
      referrer: entryRow.referrer,
      params: attributionParams(entryParams),
    },
    countryCode: profileRow.country,
    countryName: formatCountryName(profileRow.country),
    cityName: profileRow.city,
    browserName: profileRow.browser,
    osName: profileRow.os,
    deviceType: profileRow.device,
    viewport: { width: profileRow.viewport_w, height: profileRow.viewport_h },
    pageviews: rows.filter((r) => r.type === "pageview").length,
    timeBeforeGoal:
      goalCompletedAt === null ? null : goalCompletedAt - entryRow.timestamp,
    goalCompletedAt,
    lastSeenAt: lastRow.timestamp,
  };
}

export function groupByVisitor(rows: JourneyRow[]): Map<string, JourneyRow[]> {
  const groups = new Map<string, JourneyRow[]>();
  for (const row of rows) {
    const existing = groups.get(row.visitor_id);
    if (existing) existing.push(row);
    else groups.set(row.visitor_id, [row]);
  }
  return groups;
}
