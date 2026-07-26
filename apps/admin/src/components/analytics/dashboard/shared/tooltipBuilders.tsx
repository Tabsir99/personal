"use client";

import type { ReactNode } from "react";
import type { TooltipSection } from "./AnalyticsTooltip";
import { formatCount, formatCurrency } from "./chartFormat";

export interface RankedTooltipItem {
  name: string;
  icon?: ReactNode;
  values: Record<string, number>;
  raw?: Record<string, unknown>;
}

export function buildRankedItemTooltip(
  item: RankedTooltipItem,
  totalVisitors: number,
): TooltipSection[] {
  const vis = item.values.visitors || 0;
  const rev = item.values.revenue || 0;
  const share = ((vis / totalVisitors) * 100).toFixed(1);
  const nw = Number(item.raw?.newVisitors);
  const rt = Number(item.raw?.returningVisitors);
  const pv = Number(item.raw?.pageviews);
  const ex = Number(item.raw?.exits);

  const sections: TooltipSection[] = [
    item.icon ? (
      <div
        key="hdr"
        className="flex items-center gap-2 px-3.5 pt-3 pb-2 text-sm font-semibold text-background"
      >
        <span className="shrink-0">{item.icon}</span>
        <span className="truncate">{item.name}</span>
      </div>
    ) : (
      item.name
    ),
    {
      label: "Visitors",
      value: `${formatCount(vis)} (${share}%)`,
      color: "series",
    },
  ];

  if (!isNaN(nw) && !isNaN(rt) && nw + rt > 0) {
    sections.push({
      meter: [
        { value: nw, color: "newVisitors", label: `${formatCount(nw)} new` },
        {
          value: rt,
          color: "returningVisitors",
          label: `${formatCount(rt)} returning`,
        },
      ],
    });
  }

  if (!isNaN(pv) && pv > 0) {
    sections.push(
      { label: "Pageviews", value: formatCount(pv) },
      {
        label: "Pages / visitor",
        value: vis > 0 ? (pv / vis).toFixed(1) : "0",
        dim: true,
      },
    );
  }

  if (!isNaN(ex) && ex > 0) {
    sections.push(
      { label: "Exit clicks", value: formatCount(ex) },
      {
        label: "Exit rate",
        value: vis > 0 ? `${((ex / vis) * 100).toFixed(1)}%` : "0%",
        dim: true,
      },
    );
  }

  if (rev > 0 && vis > 0) {
    sections.push(
      { label: "Revenue", value: formatCurrency(rev), color: "revenue" },
      {
        label: "Revenue / visitor",
        value: `$${(rev / vis).toFixed(2)}`,
        dim: true,
      },
    );
  }

  return sections;
}

export interface ChannelSliceTooltipData {
  name: string;
  value: number;
  newVisitors?: number;
  returningVisitors?: number;
  revenue?: number;
}

export function buildChannelSliceTooltip(
  slice: ChannelSliceTooltipData,
  totalVisitors: number,
): TooltipSection[] {
  const share = Math.round((slice.value / totalVisitors) * 100);
  const sections: TooltipSection[] = [
    <div
      key="hdr"
      className="px-3.5 pt-3 pb-2 text-sm font-semibold text-background"
    >
      {slice.name}
    </div>,
    {
      label: "Visitors",
      value: `${formatCount(slice.value)} (${share}%)`,
      color: "series",
    },
  ];

  if (
    typeof slice.newVisitors === "number" &&
    typeof slice.returningVisitors === "number" &&
    slice.newVisitors + slice.returningVisitors > 0
  ) {
    sections.push({
      meter: [
        {
          value: slice.newVisitors,
          color: "newVisitors",
          label: `${formatCount(slice.newVisitors)} new`,
        },
        {
          value: slice.returningVisitors,
          color: "returningVisitors",
          label: `${formatCount(slice.returningVisitors)} returning`,
        },
      ],
    });
  }

  if (typeof slice.revenue === "number" && slice.revenue > 0) {
    sections.push(
      { label: "Revenue", value: formatCurrency(slice.revenue), color: "revenue" },
      {
        label: "Revenue / visitor",
        value: slice.value > 0 ? `$${(slice.revenue / slice.value).toFixed(2)}` : "$0.00",
        dim: true,
      },
    );
  }

  return sections;
}
