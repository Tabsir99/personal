import type { ReactElement } from "react";
import { Area, Bar } from "recharts";
import { motion, useTransform, type MotionValue } from "motion/react";
import type { TimeseriesPoint } from "@/lib/analyticsTypes";
import type { ChartMetric } from "./MetricsBar";
import { CHART, REVERSAL } from "../shared/chartTheme";
import { formatMetric } from "../shared/chartFormat";
import {
  NO_REVENUE,
  REVERSAL_KINDS,
  reversalAmount,
  revenueParts,
  type ReversalKind,
} from "../shared/revenue";

export type Selection = ChartMetric | null;

export interface MainChartRow extends TimeseriesPoint {
  revenueExtent: number;
}

export function toChartRow(point: TimeseriesPoint): MainChartRow {
  return { ...point, revenueExtent: revenueParts(point.revenue).total };
}

const REVEAL_DOT = { r: 4, stroke: CHART.surface, strokeWidth: 2 };
const ANIM = { animationDuration: 1000, animationEasing: "ease-out" } as const;

function singleArea(key: string): ReactElement[] {
  return [
    <Area
      key={`${key}-muted`}
      yAxisId="left"
      type="monotone"
      dataKey={key}
      stroke={CHART.muted}
      strokeWidth={2}
      strokeOpacity={0.18}
      fill="url(#muted-vertical-fill)"
      tooltipType="none"
      activeDot={false}
      isAnimationActive={false}
    />,
    <Area
      key={`${key}-active`}
      yAxisId="left"
      type="monotone"
      dataKey={key}
      stroke={CHART.series}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="url(#active-vertical-fill)"
      mask="url(#hover-mask)"
      activeDot={{ ...REVEAL_DOT, fill: CHART.series }}
      {...ANIM}
    />,
  ];
}

function stackedVisitors(): ReactElement[] {
  return [
    <Area
      key="new-muted"
      yAxisId="left"
      stackId="muted"
      type="monotone"
      dataKey="newVisitors"
      stroke={CHART.muted}
      strokeWidth={1}
      strokeOpacity={0.12}
      fill={CHART.muted}
      fillOpacity={0.04}
      tooltipType="none"
      activeDot={false}
      isAnimationActive={false}
    />,
    <Area
      key="ret-muted"
      yAxisId="left"
      stackId="muted"
      type="monotone"
      dataKey="returningVisitors"
      stroke={CHART.muted}
      strokeWidth={1}
      strokeOpacity={0.12}
      fill={CHART.muted}
      fillOpacity={0.04}
      tooltipType="none"
      activeDot={false}
      isAnimationActive={false}
    />,
    <Area
      key="new-active"
      yAxisId="left"
      stackId="active"
      type="monotone"
      dataKey="newVisitors"
      stroke={CHART.newVisitors}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={CHART.newVisitors}
      fillOpacity={0.1}
      mask="url(#hover-mask)"
      activeDot={{ ...REVEAL_DOT, fill: CHART.newVisitors }}
      {...ANIM}
    />,
    <Area
      key="ret-active"
      yAxisId="left"
      stackId="active"
      type="monotone"
      dataKey="returningVisitors"
      stroke={CHART.returningVisitors}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={CHART.returningVisitors}
      fillOpacity={0.16}
      mask="url(#hover-mask)"
      activeDot={{ ...REVEAL_DOT, fill: CHART.returningVisitors }}
      {...ANIM}
    />,
  ];
}

const SEGMENT_GAP = 2;
const BAR_RADIUS = 3;
const REVERSAL_STROKE_INSET = 0.5;

interface BarSegment {
  kind: ReversalKind | null;
  y: number;
  height: number;
  roundTop: boolean;
  roundBottom: boolean;
}

function barSegments(
  top: number,
  height: number,
  revenue: TimeseriesPoint["revenue"],
): BarSegment[] {
  const parts = revenueParts(revenue);
  if (parts.total <= 0) return [];

  const scale = height / parts.total;
  const stacked: { kind: ReversalKind | null; value: number }[] = [
    { kind: null, value: parts.kept },
    ...REVERSAL_KINDS.map((kind) => ({
      kind,
      value: reversalAmount(parts, kind),
    })),
  ].filter((segment) => segment.value > 0);

  const gap = stacked.length > 1 ? SEGMENT_GAP : 0;
  let bottom = top + height;

  return stacked.map(({ kind, value }, i) => {
    const span = value * scale;
    const topmost = i === stacked.length - 1;
    const drawn = Math.max(0, topmost ? span : span - gap);
    const segment = {
      kind,
      y: bottom - drawn,
      height: drawn,
      roundTop: topmost,
      roundBottom: i === 0,
    };
    bottom -= span;
    return segment;
  });
}

function segmentPath(
  x: number,
  y: number,
  width: number,
  height: number,
  topRadius: number,
  bottomRadius: number,
): string {
  const limit =
    topRadius > 0 && bottomRadius > 0
      ? Math.min(height / 2, width / 2)
      : height;
  const clamp = (r: number) => Math.max(0, Math.min(r, limit, width / 2));
  const rt = clamp(topRadius);
  const rb = clamp(bottomRadius);
  const right = x + width;
  const bottom = y + height;
  return [
    `M ${x} ${bottom - rb}`,
    `V ${y + rt}`,
    rt > 0 && `A ${rt} ${rt} 0 0 1 ${x + rt} ${y}`,
    `H ${right - rt}`,
    rt > 0 && `A ${rt} ${rt} 0 0 1 ${right} ${y + rt}`,
    `V ${bottom - rb}`,
    rb > 0 && `A ${rb} ${rb} 0 0 1 ${right - rb} ${bottom}`,
    `H ${x + rb}`,
    rb > 0 && `A ${rb} ${rb} 0 0 1 ${x} ${bottom - rb}`,
    "Z",
  ]
    .filter(Boolean)
    .join(" ");
}

interface RevenueBarShapeProps {
  index?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: MainChartRow;
  front: MotionValue<number>;
}

function RevenueBarShape({
  index = 0,
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
  front,
}: RevenueBarShapeProps) {
  const lit = useTransform(front, (f) =>
    Math.max(0, Math.min(1, f - index + 1)),
  );
  const muted = useTransform(lit, (v) => 1 - v);
  const shared = { x, y, width, height, rx: 3 } as const;

  return (
    <g>
      <motion.rect
        {...shared}
        fill={CHART.muted}
        fillOpacity={0.2}
        style={{ scaleY: muted, originY: 0, transformBox: "fill-box" }}
      />
      <motion.g style={{ scaleY: lit, originY: 1, transformBox: "fill-box" }}>
        <rect {...shared} fill="none" />
        {barSegments(y, height, payload?.revenue ?? NO_REVENUE).map(
          (segment) => {
            const rt = segment.roundTop ? BAR_RADIUS : 0;
            const rb = segment.roundBottom ? BAR_RADIUS : 0;
            if (!segment.kind) {
              return (
                <path
                  key="kept"
                  d={segmentPath(x, segment.y, width, segment.height, rt, rb)}
                  fill={CHART.revenue}
                  fillOpacity={0.75}
                />
              );
            }
            const style = REVERSAL[segment.kind];
            const inset = REVERSAL_STROKE_INSET;
            return (
              <path
                key={segment.kind}
                d={segmentPath(
                  x + inset,
                  segment.y + inset,
                  Math.max(0, width - inset * 2),
                  Math.max(0, segment.height - inset * 2),
                  rt - inset,
                  rb - inset,
                )}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={1}
                strokeDasharray={style.dash}
                vectorEffect="non-scaling-stroke"
              />
            );
          },
        )}
      </motion.g>
    </g>
  );
}

function revenueBars(front: MotionValue<number>): ReactElement[] {
  return [
    <Bar
      key="revenue"
      yAxisId="revenue"
      dataKey="revenueExtent"
      maxBarSize={26}
      activeBar={false}
      animationDuration={600}
      animationEasing="ease-out"
      shape={(props) => <RevenueBarShape {...props} front={front} />}
    />,
  ];
}

export function renderSeries(
  selection: Selection,
  front: MotionValue<number>,
): ReactElement[] {
  switch (selection) {
    case "visitors":
      return stackedVisitors();
    case "conversionRate":
      return singleArea("conversionRate");
    case "pageviews":
      return singleArea("pageviews");
    case "sessions":
      return singleArea("sessions");
    case "bounceRate":
      return singleArea("bounceRate");
    case "sessionDuration":
      return singleArea("sessionDuration");
    case null:
      return [...revenueBars(front), ...singleArea("visitors")];
  }
}

export function leftAxisFormat(selection: Selection): (v: number) => string {
  const metric = selection ?? "visitors";
  return (v) => formatMetric(metric, v);
}
