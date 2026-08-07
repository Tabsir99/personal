import type { AnalyticsEventRow } from "@tabsircg/schemas/analytics";
import { CHANNELS } from "@/app/api/analytics/sources/channels";
import {
  CAMPAIGN_DIMENSIONS,
  rollupCampaigns,
  type CampaignDimension,
  type CampaignMetric,
} from "@/lib/analyticsTypes";

/** Independent JS reference for the analytics queries: plain loops over the
 * seeded rows, so agreement with ClickHouse validates the SQL. */

type Row = AnalyticsEventRow;
export interface Win {
  start: number;
  end: number;
}

const uniq = (xs: string[]) => new Set(xs).size;

export interface Split {
  charge: number;
  refund: number;
  dispute: number;
}

const KINDS = ["charge", "refund", "dispute"] as const;

const noCents = (): Split => ({ charge: 0, refund: 0, dispute: 0 });

const round = (cents: Split): Split => ({
  charge: cents.charge / 100,
  refund: cents.refund / 100,
  dispute: cents.dispute / 100,
});

function addCents(into: Split, from: Split | undefined): void {
  if (!from) return;
  for (const kind of KINDS) into[kind] += from[kind];
}

function paymentKind(raw: string): keyof Split | null {
  let kind = "";
  try {
    const parsed = JSON.parse(raw || "{}") as Record<string, unknown>;
    kind = typeof parsed.kind === "string" ? parsed.kind : "";
  } catch {
    kind = "";
  }
  return KINDS.includes(kind as keyof Split) ? (kind as keyof Split) : null;
}

function goalNameOf(r: Row): string {
  if (r.type !== "payment") return r.event_name;
  const kind = paymentKind(r.extra_data);
  return kind === "refund" || kind === "dispute" ? "" : r.event_name;
}

function isCharge(r: Row): boolean {
  return paymentKind(r.extra_data) === "charge";
}

function human(rows: Row[], type: string, w: Win): Row[] {
  return rows.filter(
    (r) =>
      r.is_bot === 0 &&
      r.type === type &&
      r.timestamp >= w.start &&
      r.timestamp < w.end,
  );
}

/** JS twin of buildChannelSQL: first channel (in order) with a matching pattern. */
export function classifyChannel(referrer: string): string {
  if (referrer === "") return "Direct";
  const low = referrer.toLowerCase();
  for (const ch of CHANNELS) {
    if (ch.patterns.length === 0) continue;
    if (ch.patterns.some((p) => low.includes(p))) return ch.name;
  }
  return "Referral";
}

/** JS twin of ClickHouse extractURLParameter (raw value, "" when absent). */
function urlParam(href: string, key: string): string {
  const q = href.split("?")[1];
  if (!q) return "";
  for (const pair of q.split("&")) {
    const eq = pair.indexOf("=");
    const k = eq === -1 ? pair : pair.slice(0, eq);
    if (k === key) return eq === -1 ? "" : pair.slice(eq + 1);
  }
  return "";
}

function visitorRevenue(rows: Row[], w: Win): Map<string, Split> {
  const m = new Map<string, Split>();
  for (const r of rows) {
    if (
      r.is_bot !== 0 ||
      r.type !== "payment" ||
      r.timestamp < w.start ||
      r.timestamp >= w.end
    )
      continue;
    const kind = paymentKind(r.extra_data);
    if (!kind) continue;
    let split = m.get(r.visitor_id);
    if (!split) m.set(r.visitor_id, (split = noCents()));
    split[kind] += r.revenue_cents;
  }
  return m;
}

interface BreakRow {
  name: string;
  uv: number;
  newVisitors: number;
  returningVisitors: number;
  revenue: Split;
}

function breakdownRef(
  pv: Row[],
  dim: (r: Row) => string,
  rev: Map<string, Split>,
): BreakRow[] {
  const minSess = new Map<string, number>();
  for (const r of pv)
    minSess.set(
      r.visitor_id,
      Math.min(minSess.get(r.visitor_id) ?? Infinity, r.session_number),
    );

  const groups = new Map<string, Set<string>>();
  for (const r of pv) {
    const key = dim(r);
    let s = groups.get(key);
    if (!s) groups.set(key, (s = new Set()));
    s.add(r.visitor_id);
  }

  const out: BreakRow[] = [];
  for (const [name, vids] of groups) {
    let nv = 0;
    let rv = 0;
    const cents = noCents();
    for (const vid of vids) {
      if ((minSess.get(vid) ?? 1) === 1) nv++;
      else rv++;
      addCents(cents, rev.get(vid));
    }
    out.push({
      name,
      uv: vids.size,
      newVisitors: nv,
      returningVisitors: rv,
      revenue: round(cents),
    });
  }
  return out;
}

interface Sess {
  vid: string;
  snum: number;
  startTs: number;
  durMs: number;
  pvs: number;
}

function sessionize(pv: Row[]): Sess[] {
  const by = new Map<string, Row[]>();
  for (const r of pv) {
    let a = by.get(r.session_id);
    if (!a) by.set(r.session_id, (a = []));
    a.push(r);
  }
  const out: Sess[] = [];
  for (const rs of by.values()) {
    const ts = rs.map((r) => r.timestamp);
    const min = Math.min(...ts);
    out.push({
      vid: rs[0].visitor_id,
      snum: rs[0].session_number,
      startTs: min,
      durMs: Math.max(...ts) - min,
      pvs: rs.length,
    });
  }
  return out;
}

function overview(sess: Sess[]) {
  const sessions = sess.length;
  const bounces = sess.filter((s) => s.pvs === 1).length;
  const totalDuration = sess.reduce((a, s) => a + s.durMs, 0);
  return {
    visitors: uniq(sess.map((s) => s.vid)),
    pageviews: sess.reduce((a, s) => a + s.pvs, 0),
    sessions,
    bounceRate: sessions ? bounces / sessions : 0,
    sessionDuration: sessions ? Math.round(totalDuration / sessions / 1000) : 0,
  };
}

export function referenceMain(
  rows: Row[],
  w: Win,
  prevStart: number,
  bucketMs: number,
) {
  const pv = rows.filter(
    (r) =>
      r.is_bot === 0 &&
      r.type === "pageview" &&
      r.timestamp >= prevStart &&
      r.timestamp < w.end,
  );
  const all = sessionize(pv);
  const cur = all.filter((s) => s.startTs >= w.start);
  const prev = all.filter((s) => s.startTs < w.start);

  const revByBucket = new Map<number, Split>();
  const payVidsByBucket = new Map<number, Set<string>>();
  for (const r of rows) {
    if (
      r.is_bot !== 0 ||
      r.type !== "payment" ||
      r.timestamp < w.start ||
      r.timestamp >= w.end
    )
      continue;
    const b = Math.floor(r.timestamp / bucketMs) * bucketMs;
    let cents = revByBucket.get(b);
    if (!cents) revByBucket.set(b, (cents = noCents()));
    const kind = paymentKind(r.extra_data);
    if (kind) cents[kind] += r.revenue_cents;
    if (!isCharge(r)) continue;
    let vids = payVidsByBucket.get(b);
    if (!vids) payVidsByBucket.set(b, (vids = new Set()));
    vids.add(r.visitor_id);
  }

  const buckets = new Map<number, Sess[]>();
  for (const s of cur) {
    const b = Math.floor(s.startTs / bucketMs) * bucketMs;
    let a = buckets.get(b);
    if (!a) buckets.set(b, (a = []));
    a.push(s);
  }

  const timeseries = [...buckets.entries()]
    .map(([b, ss]) => {
      const o = overview(ss);
      const paying = payVidsByBucket.get(b)?.size ?? 0;
      return {
        timestamp: b,
        visitors: o.visitors,
        newVisitors: uniq(ss.filter((s) => s.snum === 1).map((s) => s.vid)),
        returningVisitors:
          o.visitors - uniq(ss.filter((s) => s.snum === 1).map((s) => s.vid)),
        pageviews: o.pageviews,
        sessions: o.sessions,
        bounceRate: o.bounceRate,
        sessionDuration: o.sessionDuration,
        revenue: round(revByBucket.get(b) ?? noCents()),
        payingVisitors: paying,
        conversionRate: o.visitors > 0 ? paying / o.visitors : 0,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  const withRevenue = (
    ov: ReturnType<typeof overview>,
    from: number,
    to: number,
  ) => {
    const pay = rows.filter(
      (r) =>
        r.is_bot === 0 &&
        r.type === "payment" &&
        r.timestamp >= from &&
        r.timestamp < to,
    );
    const payingVisitors = uniq(pay.filter(isCharge).map((r) => r.visitor_id));
    const cents = noCents();
    for (const r of pay) {
      const kind = paymentKind(r.extra_data);
      if (kind) cents[kind] += r.revenue_cents;
    }
    return {
      ...ov,
      revenue: round(cents),
      payingVisitors,
      conversionRate: ov.visitors > 0 ? payingVisitors / ov.visitors : 0,
    };
  };

  return {
    current: withRevenue(overview(cur), w.start, w.end),
    previous: withRevenue(overview(prev), prevStart, w.start),
    timeseries,
  };
}

export function referenceSources(rows: Row[], w: Win) {
  const pv = human(rows, "pageview", w);
  const rev = visitorRevenue(rows, w);

  const referrers = breakdownRef(pv, (r) => r.referrer, rev).map((b) => ({
    name: b.name,
    channel: classifyChannel(b.name),
    newVisitors: b.newVisitors,
    returningVisitors: b.returningVisitors,
    revenue: b.revenue,
  }));
  const channels = breakdownRef(
    pv,
    (r) => classifyChannel(r.referrer),
    rev,
  ).map((b) => ({
    name: b.name,
    newVisitors: b.newVisitors,
    returningVisitors: b.returningVisitors,
    revenue: b.revenue,
  }));

  const dims = Object.fromEntries(
    CAMPAIGN_DIMENSIONS.map((d) => [
      d,
      breakdownRef(pv, (r) => urlParam(r.href, d), rev)
        .filter((b) => b.name !== "")
        .map((b) => ({ name: b.name, uv: b.uv, revenue: b.revenue })),
    ]),
  ) as Record<CampaignDimension, CampaignMetric[]>;

  return { referrers, channels, campaigns: rollupCampaigns(dims) };
}

export function referencePages(rows: Row[], w: Win) {
  const pv = human(rows, "pageview", w);
  const rev = visitorRevenue(rows, w);
  const sumRev = (vids: Set<string>) => {
    const cents = noCents();
    for (const vid of vids) addCents(cents, rev.get(vid));
    return round(cents);
  };

  const pageG = new Map<string, { vids: Set<string>; count: number }>();
  for (const r of pv) {
    let g = pageG.get(r.href);
    if (!g) pageG.set(r.href, (g = { vids: new Set(), count: 0 }));
    g.vids.add(r.visitor_id);
    g.count++;
  }
  const pages = [...pageG].map(([name, g]) => ({
    name,
    uv: g.vids.size,
    pageviews: g.count,
    revenue: sumRev(g.vids),
  }));

  const entry = new Map<string, { href: string; ts: number }>();
  for (const r of pv) {
    const e = entry.get(r.visitor_id);
    if (!e || r.timestamp < e.ts)
      entry.set(r.visitor_id, { href: r.href, ts: r.timestamp });
  }
  const entryG = new Map<string, Set<string>>();
  for (const [vid, e] of entry) {
    let s = entryG.get(e.href);
    if (!s) entryG.set(e.href, (s = new Set()));
    s.add(vid);
  }
  const entryPages = [...entryG].map(([name, vids]) => ({
    name,
    uv: vids.size,
    revenue: sumRev(vids),
  }));

  const hostG = new Map<string, Set<string>>();
  for (const r of pv) {
    let s = hostG.get(r.domain);
    if (!s) hostG.set(r.domain, (s = new Set()));
    s.add(r.visitor_id);
  }
  const hostnames = [...hostG].map(([name, vids]) => ({
    name,
    uv: vids.size,
    revenue: sumRev(vids),
  }));

  const exitG = new Map<string, { vids: Set<string>; count: number }>();
  for (const r of human(rows, "external_link", w)) {
    let destination = "";
    try {
      destination = String(JSON.parse(r.extra_data || "{}").url ?? "");
    } catch {
      destination = "";
    }
    if (!destination) continue;
    let g = exitG.get(destination);
    if (!g) exitG.set(destination, (g = { vids: new Set(), count: 0 }));
    g.vids.add(r.visitor_id);
    g.count++;
  }
  const exitLinks = [...exitG].map(([name, g]) => ({
    name,
    uv: g.vids.size,
    exits: g.count,
    revenue: round(noCents()),
  }));

  return { pages, entryPages, hostnames, exitLinks };
}

const toUv = (b: BreakRow) => ({ name: b.name, uv: b.uv, revenue: b.revenue });

// A region or city name is only unique under its parents; keying on the bare
// name would let the reference agree with the bug it exists to catch.
const GEO_SEP = "\u0000";

const toGeo = (b: BreakRow) => {
  const parts = b.name.split(GEO_SEP);
  return {
    name: parts[parts.length - 1],
    country: parts[0],
    region: parts.length > 2 ? parts[1] : undefined,
    uv: b.uv,
    revenue: b.revenue,
  };
};

export function referenceLocations(rows: Row[], w: Win) {
  const pv = human(rows, "pageview", w);
  const rev = visitorRevenue(rows, w);
  return {
    countries: breakdownRef(pv, (r) => r.country, rev).map(toGeo),
    regions: breakdownRef(
      pv,
      (r) => [r.country, r.region].join(GEO_SEP),
      rev,
    ).map(toGeo),
    cities: breakdownRef(
      pv,
      (r) => [r.country, r.region, r.city].join(GEO_SEP),
      rev,
    ).map(toGeo),
  };
}

export function referenceSystem(rows: Row[], w: Win) {
  const pv = human(rows, "pageview", w);
  const rev = visitorRevenue(rows, w);
  return {
    browsers: breakdownRef(pv, (r) => r.browser, rev).map(toUv),
    os: breakdownRef(pv, (r) => r.os, rev).map(toUv),
    devices: breakdownRef(pv, (r) => r.device, rev).map(toUv),
  };
}

const MAX_GOALS = 30;

export function referenceGoals(rows: Row[], w: Win, bucketMs: number) {
  const totalVisitors = uniq(
    human(rows, "pageview", w).map((r) => r.visitor_id),
  );
  const nonPv = rows.filter(
    (r) =>
      r.is_bot === 0 &&
      r.type !== "pageview" &&
      r.timestamp >= w.start &&
      r.timestamp < w.end,
  );
  const g = new Map<string, { vids: Set<string>; total: number }>();
  for (const r of nonPv) {
    const goal = goalNameOf(r);
    if (!goal) continue;
    let e = g.get(goal);
    if (!e) g.set(goal, (e = { vids: new Set(), total: 0 }));
    e.vids.add(r.visitor_id);
    e.total++;
  }
  const goals = [...g]
    .map(([name, e]) => ({
      name,
      uv: e.vids.size,
      total: e.total,
      conversionRate: totalVisitors ? e.vids.size / totalVisitors : 0,
    }))
    .sort((a, b) => b.uv - a.uv || a.name.localeCompare(b.name))
    .slice(0, MAX_GOALS);

  const names = goals.map((x) => x.name);
  const kept = new Set(names);

  const byBucket = new Map<number, Record<string, number>>();
  for (const r of nonPv) {
    if (!kept.has(goalNameOf(r))) continue;
    const b = Math.floor(r.timestamp / bucketMs) * bucketMs;
    let point = byBucket.get(b);
    if (!point) {
      byBucket.set(b, (point = { timestamp: b }));
      for (const n of names) point[n] = 0;
    }
    point[goalNameOf(r)] += 1;
  }

  const series: Record<string, number>[] = [];
  for (
    let b = Math.floor(w.start / bucketMs) * bucketMs;
    b < w.end;
    b += bucketMs
  ) {
    const point = byBucket.get(b);
    if (point) {
      series.push(point);
    } else {
      const empty: Record<string, number> = { timestamp: b };
      for (const n of names) empty[n] = 0;
      series.push(empty);
    }
  }

  const catalog = [
    ...new Set(
      rows
        .filter((r) => r.is_bot === 0 && r.type === "custom")
        .map((r) => r.event_name),
    ),
  ].sort((a, b) => a.localeCompare(b));

  return { goals, series, catalog, totalVisitors };
}

export function referenceBots(rows: Row[], w: Win, bucketMs: number) {
  const bot = rows.filter(
    (r) => r.is_bot === 1 && r.timestamp >= w.start && r.timestamp < w.end,
  );

  const catTotals = new Map<string, number>();
  for (const r of bot) {
    const c = r.bot_category || "generic";
    catTotals.set(c, (catTotals.get(c) ?? 0) + 1);
  }
  const categories = [...catTotals]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
  const activeCats = categories.map((c) => c.category);
  const total = categories.reduce((a, c) => a + c.count, 0);

  const nameG = new Map<string, { category: string; count: number }>();
  for (const r of bot) {
    let e = nameG.get(r.bot_name);
    if (!e)
      nameG.set(
        r.bot_name,
        (e = { category: r.bot_category || "generic", count: 0 }),
      );
    e.count++;
  }
  const bots = [...nameG].map(([name, e]) => ({
    name,
    category: e.category,
    count: e.count,
  }));

  const seriesByBucket = new Map<number, Map<string, number>>();
  for (const r of bot) {
    const b = Math.floor(r.timestamp / bucketMs) * bucketMs;
    let m = seriesByBucket.get(b);
    if (!m) seriesByBucket.set(b, (m = new Map()));
    const cat = r.bot_category || "generic";
    m.set(cat, (m.get(cat) ?? 0) + 1);
  }
  const timeseries: Record<string, number>[] = [];
  for (
    let b = Math.floor(w.start / bucketMs) * bucketMs;
    b < w.end;
    b += bucketMs
  ) {
    const point: Record<string, number> = { timestamp: b };
    for (const c of activeCats) point[c] = 0;
    const m = seriesByBucket.get(b);
    if (m) for (const [cat, n] of m) point[cat] = n;
    timeseries.push(point);
  }

  return { total, categories, timeseries, bots, activeCats };
}

function toPath(href: string): string {
  try {
    const u = new URL(href);
    return u.pathname + u.search || "/";
  } catch {
    return href || "/";
  }
}

export function referenceBotPages(rows: Row[], w: Win, botName: string) {
  const bot = rows.filter(
    (r) =>
      r.is_bot === 1 &&
      r.bot_name === botName &&
      r.timestamp >= w.start &&
      r.timestamp < w.end,
  );
  const byPath = new Map<string, number>();
  for (const r of bot) {
    const p = toPath(r.href);
    byPath.set(p, (byPath.get(p) ?? 0) + 1);
  }
  const pages = [...byPath]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  return {
    bot: botName,
    category: bot.length ? bot[0].bot_category || "generic" : "generic",
    total: pages.reduce((a, p) => a + p.count, 0),
    pages,
  };
}
