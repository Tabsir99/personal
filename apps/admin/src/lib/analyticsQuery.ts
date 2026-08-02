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

// rev repeats on every row a visitor fans out to, so a plain SUM over-counts.
// Holds one entry per visitor per level; visitor_id is a UUID column for that.
const REVENUE_METRIC =
  "round(arraySum(x -> x.2, groupUniqArray((vid, ifNull(rev, 0)))) / 100) as revenue";

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

/** Top-N visitor breakdown, one GROUPING SETS scan per level. Levels are
 * independent unless `.nested()`, which keys each on the prefix above it. */
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
      // Nested levels share their parents' keys, so the innermost must be
      // tested first or every row reads as the outermost.
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
