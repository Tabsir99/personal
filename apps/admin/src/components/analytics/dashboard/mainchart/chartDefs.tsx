import type { ReactElement } from "react";
import { CHART } from "../chartTheme";

export function chartDefs(targetOffset: number): ReactElement {
  return (
    <defs>
      <linearGradient id="active-vertical-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={CHART.series} stopOpacity={0.28} />
        <stop offset="30%" stopColor={CHART.series} stopOpacity={0.12} />
        <stop offset="60%" stopColor={CHART.series} stopOpacity={0.04} />
        <stop offset="100%" stopColor={CHART.series} stopOpacity={0} />
      </linearGradient>

      <linearGradient id="muted-vertical-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={CHART.muted} stopOpacity={0.18} />
        <stop offset="35%" stopColor={CHART.muted} stopOpacity={0.08} />
        <stop offset="100%" stopColor={CHART.muted} stopOpacity={0} />
      </linearGradient>

      <mask id="hover-mask" maskContentUnits="objectBoundingBox">
        <rect x="0" y="0" width="1" height="1" fill="black" />
        <rect
          x="0"
          y="0"
          width="1"
          height="1"
          fill="white"
          style={{
            transform: `scaleX(${targetOffset})`,
            transformOrigin: "left",
            transition: "transform 0.4s ease-out",
          }}
        />
      </mask>
    </defs>
  );
}
