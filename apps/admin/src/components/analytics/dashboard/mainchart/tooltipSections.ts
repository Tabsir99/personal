import type { Point, TooltipSection } from "../shared/AnalyticsTooltip";
import {
  formatBounce,
  formatConversion,
  formatCurrency,
  formatDuration,
} from "../shared/chartFormat";
import type { Selection } from "./series";

function visitorMeter(nw: number, rt: number): TooltipSection {
  return {
    meter: [
      { value: nw, color: "newVisitors", label: `${nw.toLocaleString()} new` },
      {
        value: rt,
        color: "returningVisitors",
        label: `${rt.toLocaleString()} returning`,
      },
    ],
  };
}

export function tooltipSections(selection: Selection, periodLabel: string) {
  return (p: Point): TooltipSection[] => {
    switch (selection) {
      case "visitors": {
        const nw = p.raw("newVisitors");
        const rt = p.raw("returningVisitors");
        return [
          p.date,
          {
            label: "Visitors",
            value: p.raw("visitors").toLocaleString(),
            color: "newVisitors",
          },
          visitorMeter(nw, rt),
          "Unique people who visited.",
        ];
      }
      case "pageviews": {
        const pv = p.raw("pageviews");
        const vis = p.raw("visitors");
        return [
          p.date,
          { label: "Pageviews", value: pv.toLocaleString(), color: "series" },
          {
            label: "Pages / visitor",
            value: vis > 0 ? (pv / vis).toFixed(1) : "0",
            dim: true,
          },
          "Total page loads, repeat views included.",
        ];
      }
      case "sessions": {
        const se = p.raw("sessions");
        const pv = p.raw("pageviews");
        return [
          p.date,
          { label: "Sessions", value: se.toLocaleString(), color: "series" },
          {
            label: "Pages / session",
            value: se > 0 ? (pv / se).toFixed(1) : "0",
            dim: true,
          },
          "Visits — a session ends after 30 min idle.",
        ];
      }
      case "conversionRate": {
        const paying = p.raw("payingVisitors");
        const vis = p.raw("visitors");
        return [
          p.date,
          {
            label: "Conversion",
            value: formatConversion(p.raw("conversionRate")),
            color: "series",
          },
          {
            label: "Buyers",
            value: `${paying.toLocaleString()} of ${vis.toLocaleString()}`,
            dim: true,
          },
          "Share of visitors who made a purchase.",
        ];
      }
      case "bounceRate":
        return [
          p.date,
          {
            label: "Bounce rate",
            value: formatBounce(p.raw("bounceRate")),
            color: "series",
          },
          "Share of sessions that left after one page.",
        ];
      case "sessionDuration":
        return [
          p.date,
          {
            label: "Session time",
            value: formatDuration(p.raw("sessionDuration")),
            color: "series",
          },
          "Avg time between a session's first and last event.",
        ];
      case null: {
        const vis = p.raw("visitors");
        const nw = p.raw("newVisitors");
        const rt = p.raw("returningVisitors");
        const rev = p.raw("revenue");
        return [
          p.date,
          { label: "Visitors", value: vis.toLocaleString(), color: "series" },
          visitorMeter(nw, rt),
          { label: "Revenue", value: formatCurrency(rev), color: "revenue" },
          {
            label: "Revenue / visitor",
            value: vis > 0 ? `$${(rev / vis).toFixed(2)}` : "$0.00",
            dim: true,
          },
          periodLabel,
        ];
      }
    }
  };
}
