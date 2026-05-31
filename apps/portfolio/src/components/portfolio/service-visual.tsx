import type { SVGProps } from "react";

/* Server component — all motion lives in services.css. */

const visStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

const FRAME1_RECTS: SVGProps<SVGRectElement>[] = [
  {
    x: 40,
    y: 60,
    width: 320,
    height: 380,
    fill: "none",
    style: { stroke: "var(--color-line)" },
  },
  {
    x: 40,
    y: 60,
    width: 320,
    height: 32,
    style: { fill: "var(--color-ink-2)" },
  },
  {
    x: 60,
    y: 120,
    width: 160,
    height: 14,
    style: { fill: "var(--color-accent)" },
    className: "svc-vis-1-main",
  },
  {
    x: 60,
    y: 142,
    width: 240,
    height: 6,
    style: { fill: "var(--color-muted)" },
    opacity: 0.5,
  },
  {
    x: 60,
    y: 154,
    width: 220,
    height: 6,
    style: { fill: "var(--color-muted)" },
    opacity: 0.5,
  },
  {
    x: 60,
    y: 190,
    width: 100,
    height: 100,
    fill: "none",
    style: { stroke: "var(--color-line)" },
  },
  {
    x: 170,
    y: 190,
    width: 100,
    height: 100,
    fill: "none",
    style: { stroke: "var(--color-line)" },
  },
  {
    x: 280,
    y: 190,
    width: 60,
    height: 100,
    fill: "none",
    style: { stroke: "var(--color-accent)" },
    strokeOpacity: 1,
  },
];

const FRAME0_LABELS = [
  "UI · React / Next",
  "API · Node / Express",
  "Data · Postgres",
  "Infra · AWS / Docker",
];

const FRAME2_NODES: Array<[number, number]> = [
  [100, 110],
  [250, 100],
  [320, 180],
  [180, 210],
  [80, 280],
  [220, 300],
];

const FRAME2_EDGES: Array<[number, number, number, number]> = [
  [100, 110, 250, 100],
  [250, 100, 320, 180],
  [320, 180, 180, 210],
  [180, 250, 80, 320],
  [80, 280, 220, 300],
  [100, 110, 180, 210],
];

const FRAME3_RING_BASES = [60, 100, 140, 180];

export function ServiceVisual({ idx }: { idx: number }) {
  const variant = ((idx % 4) + 4) % 4;
  if (variant === 0) {
    return (
      <svg
        viewBox="0 0 400 500"
        style={visStyle}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="svc-g1" x1="0" x2="1">
            <stop
              offset="0%"
              style={{ stopColor: "var(--color-accent)" }}
              stopOpacity="0.15"
            />
            <stop
              offset="100%"
              style={{ stopColor: "var(--color-accent)" }}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => {
          const y = 80 + i * 50;
          return (
            <g
              key={i}
              className="svc-vis-0-row"
              style={{ "--i": i } as React.CSSProperties}
            >
              <rect
                x={60}
                y={y}
                width={280}
                height={36}
                fill="none"
                style={{ stroke: "var(--color-accent)" }}
                strokeOpacity={0.4}
              />
              <rect
                x={60}
                y={y}
                width={280 * (0.3 + i * 0.2)}
                height={36}
                fill="url(#svc-g1)"
              />
              <text
                x={70}
                y={y + 22}
                style={{ fill: "var(--color-cream)" }}
                fontFamily="JetBrains Mono"
                fontSize="10"
                letterSpacing="0.1em"
              >
                {FRAME0_LABELS[i]}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }
  if (variant === 1) {
    return (
      <svg viewBox="0 0 400 500" style={visStyle}>
        {FRAME1_RECTS.map((r, i) => (
          <rect key={i} {...r} />
        ))}
        <circle cx="56" cy="76" r="4" style={{ fill: "var(--color-accent)" }} />
        <line
          className="svc-vis-1-line"
          x1="280"
          x2="340"
          y1="190"
          y2="190"
          style={{ stroke: "var(--color-accent)" }}
        />
      </svg>
    );
  }
  if (variant === 2) {
    return (
      <svg viewBox="0 0 400 500" style={visStyle}>
        {FRAME2_NODES.map(([x, y], i) => (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r={i === 0 ? 16 : 10}
              fill="none"
              style={{ stroke: "var(--color-accent)" }}
              strokeOpacity={0.7}
            />
            <circle
              className="svc-vis-2-c"
              style={
                { "--i": i, fill: "var(--color-accent)" } as React.CSSProperties
              }
              cx={x}
              cy={y}
              opacity={0.8}
            />
          </g>
        ))}
        {FRAME2_EDGES.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            style={{ stroke: "var(--color-line)" }}
            strokeDasharray="2 4"
          />
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 400 500" style={visStyle}>
      {FRAME3_RING_BASES.map((r, i) => (
        <circle
          key={i}
          className="svc-vis-3-c"
          style={
            {
              "--base": `${r}px`,
              stroke: "var(--color-accent)",
            } as React.CSSProperties
          }
          cx="200"
          cy="240"
          fill="none"
          strokeOpacity={0.15 + i * 0.12}
          strokeDasharray={i === 2 ? "4 6" : "none"}
        />
      ))}
      <circle cx="200" cy="240" r="6" style={{ fill: "var(--color-accent)" }} />
      <text
        x="200"
        y="244"
        textAnchor="middle"
        style={{ fill: "var(--color-ink)" }}
        fontFamily="JetBrains Mono"
        fontSize="8"
        fontWeight="700"
      >
        CG
      </text>
    </svg>
  );
}
