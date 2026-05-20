"use client";
import { useEffect, useRef, type SVGProps } from "react";

/* Abstract visual per service. Was a pure-render component driven by
   `sub` prop; now the parent <Services> is server-rendered, so each
   instance subscribes to its containing [data-pin-steps] wrap:
   - MutationObserver watches data-pin-step to toggle "am I active"
   - When active, a RAF reads --pin-sub from the wrap and mutates SVG
     attributes (sin-driven offsets, growing radii, etc.)
   - When inactive, the parent .svc-frame is opacity 0, so we just stop
     the RAF and freeze the SVG at its last frame. */

const visStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

// idx=1 — wireframe of a UI card. All rects laid out as data; rendered
// via spread. The lone circle + animated line stay inline below since
// each is a one-off shape.
const FRAME1_RECTS: SVGProps<SVGRectElement>[] = [
  { x: 40, y: 60, width: 320, height: 380, fill: "none", style: { stroke: "var(--color-line)" } },
  { x: 40, y: 60, width: 320, height: 32, style: { fill: "var(--color-ink-2)" } },
  { x: 60, y: 120, width: 160, height: 14, style: { fill: "var(--color-accent)" }, opacity: 0.6, "data-anim": "main" },
  { x: 60, y: 142, width: 240, height: 6, style: { fill: "var(--color-muted)" }, opacity: 0.5 },
  { x: 60, y: 154, width: 220, height: 6, style: { fill: "var(--color-muted)" }, opacity: 0.5 },
  { x: 60, y: 190, width: 100, height: 100, fill: "none", style: { stroke: "var(--color-line)" } },
  { x: 170, y: 190, width: 100, height: 100, fill: "none", style: { stroke: "var(--color-line)" } },
  { x: 280, y: 190, width: 60, height: 100, fill: "none", style: { stroke: "var(--color-accent)" }, strokeOpacity: 1 },
];

export function ServiceVisual({ idx }: { idx: number }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const wrap = root.closest<HTMLElement>("[data-pin-steps]");
    if (!wrap) return;

    let raf = 0;
    const tick = () => {
      raf = 0;
      const sub =
        parseFloat(getComputedStyle(wrap).getPropertyValue("--pin-sub")) || 0;
      apply(idx, sub, root);
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      const active = wrap.dataset.pinStep === String(idx);
      if (active && !raf) raf = requestAnimationFrame(tick);
      else if (!active && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const mo = new MutationObserver(sync);
    mo.observe(wrap, { attributes: true, attributeFilter: ["data-pin-step"] });
    sync();

    return () => {
      mo.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [idx]);

  if (idx === 0) {
    return (
      <svg
        ref={ref}
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
          const y = 120 + i * 50;
          return (
            <g key={i}>
              <rect
                data-anim-i={i}
                data-anim-base="60"
                x={60}
                y={y}
                width={280}
                height={36}
                fill="none"
                style={{ stroke: "var(--color-accent)" }}
                strokeOpacity={0.4}
              />
              <rect
                data-anim-i={i}
                data-anim-base="60"
                x={60}
                y={y}
                width={280 * (0.3 + i * 0.2)}
                height={36}
                fill="url(#svc-g1)"
              />
              <text
                data-anim-i={i}
                data-anim-base="70"
                x={70}
                y={y + 22}
                style={{ fill: "var(--color-cream)" }}
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
        <circle cx="200" cy="80" r="3" style={{ fill: "var(--color-phosphor)" }}>
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
    return (
      <svg ref={ref} viewBox="0 0 400 500" style={visStyle}>
        {FRAME1_RECTS.map((r, i) => (
          <rect key={i} {...r} />
        ))}
        <circle cx="56" cy="76" r="4" style={{ fill: "var(--color-accent)" }} />
        <line
          data-anim="line"
          x1="280"
          y1="190"
          x2="340"
          y2="190"
          style={{ stroke: "var(--color-accent)" }}
        />
      </svg>
    );
  }
  if (idx === 2) {
    const nodes: Array<[number, number]> = [
      [100, 150],
      [250, 130],
      [320, 220],
      [180, 250],
      [80, 320],
      [220, 340],
    ];
    const edges: Array<[number, number, number, number]> = [
      [100, 150, 250, 130],
      [250, 130, 320, 220],
      [320, 220, 180, 250],
      [180, 250, 80, 320],
      [80, 320, 220, 340],
      [100, 150, 180, 250],
    ];
    return (
      <svg ref={ref} viewBox="0 0 400 500" style={visStyle}>
        {nodes.map(([x, y], i) => (
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
              data-anim-i={i}
              cx={x}
              cy={y}
              r={4}
              style={{ fill: "var(--color-accent)" }}
              opacity={0.8}
            />
          </g>
        ))}
        {edges.map(([x1, y1, x2, y2], i) => (
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
  // idx 3 — advisory: concentric rings
  return (
    <svg ref={ref} viewBox="0 0 400 500" style={visStyle}>
      {[60, 100, 140, 180].map((r, i) => (
        <circle
          key={i}
          data-anim-i={i}
          data-anim-base={r}
          cx="200"
          cy="240"
          r={r}
          fill="none"
          style={{ stroke: "var(--color-accent)" }}
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

function apply(idx: number, sub: number, root: SVGSVGElement) {
  if (idx === 0) {
    const els = root.querySelectorAll<SVGGraphicsElement>("[data-anim-i]");
    els.forEach((el) => {
      const i = Number(el.dataset.animI);
      const off = Math.sin(sub * Math.PI * 2 + i) * 8;
      const base = Number(el.dataset.animBase || 0);
      el.setAttribute("x", String(base + off));
    });
  } else if (idx === 1) {
    const main = root.querySelector<SVGRectElement>("[data-anim='main']");
    if (main) main.setAttribute("opacity", String(0.6 + sub * 0.4));
    const line = root.querySelector<SVGLineElement>("[data-anim='line']");
    if (line) {
      const y = 190 + sub * 100;
      line.setAttribute("y1", String(y));
      line.setAttribute("y2", String(y));
    }
  } else if (idx === 2) {
    root.querySelectorAll<SVGCircleElement>("[data-anim-i]").forEach((c) => {
      const i = Number(c.dataset.animI);
      c.setAttribute("r", String(4 + Math.sin(sub * Math.PI * 4 + i) * 2));
    });
  } else if (idx === 3) {
    root.querySelectorAll<SVGCircleElement>("[data-anim-i]").forEach((c) => {
      const base = Number(c.dataset.animBase);
      c.setAttribute("r", String(base + sub * 8));
    });
  }
}
