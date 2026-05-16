/* abstract visual per service — placeholder-y geometric scenes that animate */
const visStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

export function ServiceVisual({
  idx,
  active,
  sub,
}: {
  idx: number;
  active: boolean;
  sub: number;
}) {
  const t = active ? sub : 0;
  if (idx === 0) {
    // Stacked layers (full-stack metaphor)
    return (
      <svg
        viewBox="0 0 400 500"
        style={visStyle}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop
              offset="0%"
              style={{ stopColor: "var(--accent)" }}
              stopOpacity="0.15"
            />
            <stop
              offset="100%"
              style={{ stopColor: "var(--accent)" }}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => {
          const y = 120 + i * 50;
          const off = active ? Math.sin(t * Math.PI * 2 + i) * 8 : 0;
          return (
            <g key={i}>
              <rect
                x={60 + off}
                y={y}
                width={280}
                height={36}
                fill="none"
                style={{ stroke: "var(--accent)" }}
                strokeOpacity={0.4}
              />
              <rect
                x={60 + off}
                y={y}
                width={280 * (active ? 0.3 + i * 0.2 : 0.3)}
                height={36}
                fill="url(#g1)"
              />
              <text
                x={70 + off}
                y={y + 22}
                style={{ fill: "var(--cream)" }}
                fontFamily="JetBrains Mono"
                fontSize="10"
                letterSpacing="0.1em"
              >
                {
                  [
                    "UI · React / Next",
                    "API · Node / tRPC",
                    "Data · Postgres",
                    "Infra · AWS / Docker",
                  ][i]
                }
              </text>
            </g>
          );
        })}
        <circle cx="200" cy="80" r="3" style={{ fill: "var(--phosphor)" }}>
          <animate
            attributeName="opacity"
            values="1;0.2;1"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    );
  }
  if (idx === 1) {
    // Frame composition (interfaces)
    return (
      <svg viewBox="0 0 400 500" style={visStyle}>
        <rect
          x="40"
          y="60"
          width="320"
          height="380"
          fill="none"
          style={{ stroke: "var(--line)" }}
        />
        <rect
          x="40"
          y="60"
          width="320"
          height="32"
          style={{ fill: "var(--ink-2)" }}
        />
        <circle cx="56" cy="76" r="4" style={{ fill: "var(--accent)" }} />
        <rect
          x="60"
          y="120"
          width="160"
          height="14"
          style={{ fill: "var(--accent)" }}
          opacity={active ? 0.6 + t * 0.4 : 0.3}
        />
        <rect
          x="60"
          y="142"
          width="240"
          height="6"
          style={{ fill: "var(--muted)" }}
          opacity="0.5"
        />
        <rect
          x="60"
          y="154"
          width="220"
          height="6"
          style={{ fill: "var(--muted)" }}
          opacity="0.5"
        />
        <rect
          x="60"
          y="190"
          width="100"
          height="100"
          fill="none"
          style={{ stroke: "var(--line)" }}
        />
        <rect
          x="170"
          y="190"
          width="100"
          height="100"
          fill="none"
          style={{ stroke: "var(--line)" }}
        />
        <rect
          x="280"
          y="190"
          width="60"
          height="100"
          fill="none"
          style={{ stroke: "var(--accent)" }}
          strokeOpacity={active ? 1 : 0.4}
        />
        <line
          x1="280"
          y1={190 + (active ? t * 100 : 0)}
          x2="340"
          y2={190 + (active ? t * 100 : 0)}
          style={{ stroke: "var(--accent)" }}
        />
      </svg>
    );
  }
  if (idx === 2) {
    // Graph nodes (data)
    return (
      <svg viewBox="0 0 400 500" style={visStyle}>
        {[
          [100, 150],
          [250, 130],
          [320, 220],
          [180, 250],
          [80, 320],
          [220, 340],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r={i === 0 ? 16 : 10}
              fill="none"
              style={{ stroke: "var(--accent)" }}
              strokeOpacity={active ? 0.7 : 0.3}
            />
            <circle
              cx={x}
              cy={y}
              r={active ? 4 + Math.sin(t * Math.PI * 4 + i) * 2 : 4}
              style={{ fill: "var(--accent)" }}
              opacity={active ? 0.8 : 0.3}
            />
          </g>
        ))}
        {[
          [100, 150, 250, 130],
          [250, 130, 320, 220],
          [320, 220, 180, 250],
          [180, 250, 80, 320],
          [80, 320, 220, 340],
          [100, 150, 180, 250],
        ].map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            style={{ stroke: "var(--line)" }}
            strokeDasharray="2 4"
          />
        ))}
      </svg>
    );
  }
  // idx 3 — advisory: concentric rings
  return (
    <svg viewBox="0 0 400 500" style={visStyle}>
      {[60, 100, 140, 180].map((r, i) => (
        <circle
          key={i}
          cx="200"
          cy="240"
          r={r + (active ? t * 8 : 0)}
          fill="none"
          style={{ stroke: "var(--accent)" }}
          strokeOpacity={0.15 + i * 0.12}
          strokeDasharray={i === 2 ? "4 6" : "none"}
        />
      ))}
      <circle cx="200" cy="240" r="6" style={{ fill: "var(--accent)" }} />
      <text
        x="200"
        y="244"
        textAnchor="middle"
        style={{ fill: "var(--ink)" }}
        fontFamily="JetBrains Mono"
        fontSize="8"
        fontWeight="700"
      >
        CG
      </text>
    </svg>
  );
}
