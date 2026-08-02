import "server-only";
import { F } from "./tinybird";

export interface BreakdownRow<L extends string = string> {
  level: L;
  name: string;
  newVisitors: number;
  returningVisitors: number;
  revenue: number;
}

export interface UvBreakdownRow<L extends string = string> {
  level: L;
  name: string;
  uv: number;
  revenue: number;
}

interface Level {
  level: string;
  alias: string;
  expr: string;
}

export function eventWhere(
  type: string,
  websiteId: string,
  start: number,
  end: number,
): string {
  return `
    ${F.websiteId} = '${websiteId}'
    AND ${F.isBot} = 0
    AND ${F.type} = '${type}'
    AND ${F.timestamp} >= ${start} AND ${F.timestamp} < ${end}
  `;
}

export function visitorRevenueSubquery(
  websiteId: string,
  start: number,
  end: number,
): string {
  return `
    SELECT ${F.visitorId} as vid, SUM(${F.revenueCents}) as rev
    FROM ${F.engine}
    WHERE ${eventWhere("payment", websiteId, start, end)}
    GROUP BY vid
  `;
}

// rev is a per-visitor total repeated on every inner row, so a plain SUM
// over-counts once a visitor fans out across multiple dimension combos in the
// scan. Dedup to one (vid, rev) pair per visitor within each group, then sum.
//
// The vid is hashed because the array only answers "already counted this
// visitor here?" — nothing reads the id back out, arraySum touches x.2 alone.
// Holding 36-char UUIDs made this the query's memory ceiling: the state spans
// every visitor with a pageview (ifNull puts non-payers in it too, so the cost
// is independent of payment volume) and GROUPING SETS keeps one state per
// level — 8 of them on the sources route.
const REVENUE_METRIC =
  "round(arraySum(x -> x.2, groupUniqArray((cityHash64(vid), ifNull(rev, 0)))) / 100) as revenue";

const NO_REVENUE_METRIC = "toFloat64(0) as revenue";

const splitMetrics = (revenue: string) => `
      uniqExactIf(vid, minSess = 1) as newVisitors,
      uniqExactIf(vid, minSess > 1) as returningVisitors,
      ${revenue}`;

const uvMetrics = (revenue: string) => `
      uniqExact(vid) as uv,
      ${revenue}`;

export interface BreakdownChain {
  level(level: string, alias: string, expr: string): BreakdownChain;
  filter(predicate: string): BreakdownChain;
  revenue(): BreakdownChain;
  splitVisitors(): BreakdownChain;
  nested(): BreakdownChain;
  column(expr: string): BreakdownChain;
  top(n: number): BreakdownChain;
  build(): string;
}

/**
 * Top-N visitor breakdown of the pageview slice, grouped by one or more dimension
 * levels in a single GROUPING SETS scan. Use for dimension breakdowns only
 * (sources, system, locations); not for heterogeneous UNION shapes like the pages
 * route, which stays hand-written.
 *
 *   breakdown(websiteId, start, end)
 *     .level(name, alias, expr)  // one dimension per call; call order = drill order
 *     .filter(predicate)         // extra WHERE conjunct (e.g. scope to a parent dim)
 *     .revenue()                 // LEFT JOIN per-visitor revenue
 *     .splitVisitors()           // new/returning columns instead of a single uv
 *     .nested()                  // each level keys on every level before it
 *     .column(expr)              // extra output column (e.g. a carried dimension)
 *     .top(n)                    // top N rows per level
 *     .build();                  // -> SQL string
 *
 * Visitors are counted once per (dimension, visitor). splitVisitors classifies each
 * visitor new/returning via a window MIN(session_number) over that same scan, so it
 * costs no extra scan and newVisitors + returningVisitors === uv.
 *
 * Levels are independent by default — a browser is not scoped by an OS. `.nested()`
 * is for hierarchies (country -> region -> city), where a bare name is ambiguous:
 * keyed on `city` alone, London GB and London CA are one group whose visitor counts
 * add up and whose carried `any(country)` picks a winner arbitrarily. Nesting keys
 * each level on the prefix above it, which both separates them and makes the
 * carried parent deterministic. The level test then has to run most-specific
 * first, since the outermost key is present in every set.
 */
export function breakdown(
  websiteId: string,
  start: number,
  end: number,
): BreakdownChain {
  const where = eventWhere("pageview", websiteId, start, end);
  const levels: Level[] = [];
  let filterExpr: string | null = null;
  let withRevenue = false;
  let split = false;
  let isNested = false;
  let extra: string | null = null;
  let perLevel = 50;

  const chain: BreakdownChain = {
    level(level, alias, expr) {
      levels.push({ level, alias, expr });
      return chain;
    },
    filter(predicate) {
      filterExpr = predicate;
      return chain;
    },
    revenue() {
      withRevenue = true;
      return chain;
    },
    splitVisitors() {
      split = true;
      return chain;
    },
    nested() {
      isNested = true;
      return chain;
    },
    column(expr) {
      extra = expr;
      return chain;
    },
    top(n) {
      perLevel = n;
      return chain;
    },
    build() {
      // Nested levels share their parents' keys, so GROUPING(outermost) = 0 in
      // every set. Test the innermost level first or every row reads as the
      // outermost one.
      const byLevel = (value: (l: Level) => string) => {
        const ordered = isNested ? [...levels].reverse() : levels;
        const last = ordered.length - 1;
        const arms = ordered.map((l, i) =>
          i < last ? `GROUPING(${l.alias}) = 0, ${value(l)}` : value(l),
        );
        return `multiIf(${arms.join(", ")})`;
      };

      const levelCol = byLevel((l) => `'${l.level}'`);
      const nameCol = byLevel((l) => `any(${l.alias})`);
      const scanDims = levels.map((l) => `${l.expr} as ${l.alias}`).join(", ");
      const carryDims = levels
        .map((l) => `d.${l.alias} as ${l.alias}`)
        .join(", ");
      const groupBy = levels.map((l) => l.alias).join(", ");
      const groupingSets = (
        isNested
          ? levels.map((_, i) => levels.slice(0, i + 1))
          : levels.map((l) => [l])
      )
        .map((keys) => `(${keys.map((l) => l.alias).join(", ")})`)
        .join(", ");

      const revenueMetric = withRevenue ? REVENUE_METRIC : NO_REVENUE_METRIC;
      const metrics = split
        ? splitMetrics(revenueMetric)
        : uvMetrics(revenueMetric);
      const orderBy = split ? "newVisitors + returningVisitors" : "uv";
      const scopeFilter = filterExpr ? ` AND ${filterExpr}` : "";
      const extraCol = extra ? `,\n      ${extra}` : "";

      const bucketMinCol = split
        ? `, min(${F.sessionNumber}) as bucketMin`
        : "";
      const minSessCol = split
        ? `, min(d.bucketMin) OVER (PARTITION BY d.vid) as minSess`
        : "";
      const revenueCol = withRevenue ? "pr.rev as rev" : "0 as rev";
      const revenueJoin = withRevenue
        ? `LEFT JOIN (${visitorRevenueSubquery(websiteId, start, end)}) pr ON d.vid = pr.vid`
        : "";

      return `
    SELECT ${levelCol} as level, ${nameCol} as name,${metrics}${extraCol}
    FROM (
      SELECT ${carryDims}, d.vid as vid${minSessCol}, ${revenueCol}
      FROM (
        SELECT ${scanDims}, ${F.visitorId} as vid${bucketMinCol}
        FROM ${F.engine}
        WHERE ${where}${scopeFilter}
        GROUP BY ${groupBy}, vid
      ) d
      ${revenueJoin}
    )
    GROUP BY GROUPING SETS (${groupingSets})
    ORDER BY ${orderBy} DESC
    LIMIT ${perLevel} BY level
  `;
    },
  };
  return chain;
}
