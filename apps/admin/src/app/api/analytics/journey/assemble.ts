import "server-only";
import type { AnalyticsEventRow } from "@tabsircg/analytics-contract";
import { formatCountryName } from "@/lib/countryUtils";
import { parseHref } from "@/lib/tinybird";
import { CAMPAIGN_DIMENSIONS } from "@/lib/analyticsTypes";
import type {
  JourneyEntry,
  JourneyPageviewEntry,
  JourneyTrackingParam,
  JourneyVisitor,
} from "@/lib/analyticsTypes";

// Applied in SQL via `LIMIT … BY visitor_id`; newest rows win, since identity
// and revenue sit at that end. Real traffic peaks near a dozen, so it never fires.
export const MAX_ROWS_PER_VISITOR = 500;

/** The datasource columns the journey query selects, in query order. */
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

// Picked from the contract so a renamed column fails to compile. `channel` is
// computed in SQL by `buildChannelSQL`, not stored.
export type JourneyRow = Pick<
  AnalyticsEventRow,
  (typeof JOURNEY_COLUMNS)[number]
> & { channel: string };

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

/** Folds a run of repeat views of the same path into one counted entry. */
function collapsePageviews(entries: JourneyEntry[]): JourneyEntry[] {
  const out: JourneyEntry[] = [];

  for (const entry of entries) {
    const previous = out[out.length - 1];
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
    out.push(entry);
  }

  return out;
}

/** Lifetime rows (ascending) -> the rendered shape. The period bounds only
 * *which* completion is reported, never which events. */
export function assembleVisitor(
  allRows: JourneyRow[],
  goalName: string | null,
  periodStart: number,
  periodEnd: number,
): JourneyVisitor {
  // The query fetches one row past the cap so truncation is detectable.
  const truncated = allRows.length > MAX_ROWS_PER_VISITOR;
  const rows = truncated ? allRows.slice(1) : allRows;

  const first = rows[0]!;
  const last = rows[rows.length - 1]!;

  // Payment rows carry no geo/UA (webhook-written), and paying then leaving is
  // the common case — so fall back to the newest row that has a profile.
  const profile =
    [...rows].reverse().find((r) => r.browser !== "" || r.country !== "") ??
    last;

  const goalRow = goalName
    ? rows.find(
        (r) =>
          r.event_name === goalName &&
          r.timestamp >= periodStart &&
          r.timestamp < periodEnd,
      )
    : undefined;
  const goalCompletedAt = goalRow?.timestamp ?? null;

  const paymentRow = [...rows]
    .reverse()
    .find((r) => r.type === "payment" && r.revenue_cents > 0);
  const identity = paymentRow ? parseExtra(paymentRow.extra_data) : {};

  const { params: entryParams } = parseHref(first.href);
  const entries = collapsePageviews(
    rows.map((row) => toEntry(row, row === goalRow)),
  );

  const referral: JourneyEntry = {
    timestamp: first.timestamp,
    eventType: "referral",
    isGoal: false,
    data: {
      domainName: first.domain,
      channel: first.channel,
      fullReferrer: first.referrer,
      trackingParams: trackingParamsFrom(entryParams),
    },
  };

  return {
    completeJourney: [referral, ...entries],
    truncated,
    visitorId: first.visitor_id,
    customerName: str(identity.customer_name),
    customerEmail: str(identity.customer_email),
    profileMetadata: identity,
    amount: rows.reduce((sum, r) => sum + r.revenue_cents, 0) / 100,
    channel: first.channel,
    sourceAttribution: {
      timestamp: first.timestamp,
      referrer: first.referrer,
      params: attributionParams(entryParams),
    },
    countryCode: profile.country,
    countryName: formatCountryName(profile.country),
    cityName: profile.city,
    browserName: profile.browser,
    osName: profile.os,
    deviceType: profile.device,
    viewport: { width: profile.viewport_w, height: profile.viewport_h },
    pageviews: rows.filter((r) => r.type === "pageview").length,
    timeBeforeGoal:
      goalCompletedAt === null ? null : goalCompletedAt - first.timestamp,
    goalCompletedAt,
    lastSeenAt: last.timestamp,
  };
}

/** Splits flat rows (ordered by visitor, then time) into per-visitor groups. */
export function groupByVisitor(rows: JourneyRow[]): Map<string, JourneyRow[]> {
  const groups = new Map<string, JourneyRow[]>();
  for (const row of rows) {
    const existing = groups.get(row.visitor_id);
    if (existing) existing.push(row);
    else groups.set(row.visitor_id, [row]);
  }
  return groups;
}
