import type { ReactElement } from "react";
import { Area, Bar } from "recharts";
import type { ChartMetric } from "../MetricsBar";
import { CHART } from "../chartTheme";
import { formatMetric } from "../chartFormat";

export type Selection = ChartMetric | null;

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

function revenueBars(activeIndex: number | null): ReactElement[] {
  return [
    <Bar
      key="revenue"
      yAxisId="revenue"
      dataKey="revenue"
      maxBarSize={26}
      activeBar={false}
      animationDuration={600}
      animationEasing="ease-out"
      shape={({ index, x, y, width, height }) => {
        const lit =
          activeIndex === null ||
          !Number.isFinite(activeIndex) ||
          index <= activeIndex;

        return (
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            rx={3}
            style={{
              fill: lit ? CHART.revenue : CHART.muted,
              fillOpacity: lit ? 0.75 : 0.2,
            }}
          />
        );
      }}
    />,
  ];
}

export function renderSeries(
  selection: Selection,
  activeIndex: number | null,
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
      return [...revenueBars(activeIndex), ...singleArea("visitors")];
  }
}

export function leftAxisFormat(selection: Selection): (v: number) => string {
  const metric = selection ?? "visitors";
  return (v) => formatMetric(metric, v);
}
