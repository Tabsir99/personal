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

export function revenueDedupedByVisitor(vid: string, rev: string): string {
  return `arraySum(x -> x.2, groupUniqArray((${vid}, ifNull(${rev}, 0)))) / 100 as revenue`;
}
