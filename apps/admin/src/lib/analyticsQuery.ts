import "server-only";
import { F } from "./tinybird";

export const REVENUE_KINDS = ["charge", "refund", "dispute"] as const;
export type RevenueKind = (typeof REVENUE_KINDS)[number];

export type RevenueSplit = Record<RevenueKind, number>;

export interface WithRevenue {
  revenue: RevenueSplit;
}

export type RevenueColumns = {
  [K in RevenueKind as `rev${Capitalize<K>}`]: number;
};

export function revenueSplit(
  row: Partial<RevenueColumns> | undefined,
): RevenueSplit {
  return {
    charge: Number(row?.revCharge ?? 0),
    refund: Number(row?.revRefund ?? 0),
    dispute: Number(row?.revDispute ?? 0),
  };
}

export function nestRevenue<T extends RevenueColumns>(
  row: T,
): Omit<T, keyof RevenueColumns> & WithRevenue {
  const { revCharge, revRefund, revDispute, ...rest } = row;
  return {
    ...rest,
    revenue: revenueSplit({ revCharge, revRefund, revDispute }),
  };
}

export interface BreakdownRow<
  L extends string = string,
> extends RevenueColumns {
  level: L;
  name: string;
  newVisitors: number;
  returningVisitors: number;
}

export interface UvBreakdownRow<
  L extends string = string,
> extends RevenueColumns {
  level: L;
  name: string;
  uv: number;
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

export const PAYMENT_KIND = `JSONExtractString(${F.extraData}, 'kind')`;

export const REVERSAL_KINDS = ["refund", "dispute"] as const;

export const GOAL_NAME = `multiIf(
  ${F.type} != 'payment', ${F.eventName},
  ${PAYMENT_KIND} IN (${REVERSAL_KINDS.map((k) => `'${k}'`).join(", ")}), '',
  ${F.eventName}
)`;

function capitalise(kind: RevenueKind): string {
  return `${kind[0]!.toUpperCase()}${kind.slice(1)}`;
}

function revenueColumn(kind: RevenueKind): keyof RevenueColumns {
  return `rev${capitalise(kind)}` as keyof RevenueColumns;
}

export function revenueCentsColumn(kind: RevenueKind): string {
  return `cents${capitalise(kind)}`;
}

export const VISITOR_REVENUE_COLUMNS = REVENUE_KINDS.map(revenueCentsColumn);

export function visitorRevenueSubquery(
  websiteId: string,
  start: number,
  end: number,
): string {
  const sums = REVENUE_KINDS.map(
    (kind) =>
      `sumIf(${F.revenueCents}, ${PAYMENT_KIND} = '${kind}') as ${revenueCentsColumn(kind)}`,
  ).join(",\n      ");

  return `
    SELECT ${F.visitorId} as vid,
      ${sums}
    FROM ${F.engine}
    WHERE ${eventWhere("payment", websiteId, start, end)}
    GROUP BY vid
  `;
}

export function revenueDedupedByVisitor(
  vid: string,
  centsAlias: string,
): string {
  const prefix = centsAlias ? `${centsAlias}.` : "";
  const tuple = `groupUniqArray((${vid}, ${REVENUE_KINDS.map(
    (kind) => `ifNull(${prefix}${revenueCentsColumn(kind)}, 0)`,
  ).join(", ")}))`;

  return REVENUE_KINDS.map(
    (kind, i) =>
      `arraySum(x -> x.${i + 2}, ${tuple}) / 100 as ${revenueColumn(kind)}`,
  ).join(",\n      ");
}
