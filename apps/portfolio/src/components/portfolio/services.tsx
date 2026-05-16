"use client";
import { useState, useEffect, useRef } from "react";

const useStateS = useState;
const useEffectS = useEffect;
const useRefS = useRef;

/* ===== Services — pinned scroll experience =====
   Wrap is 400vh tall. As user scrolls through it, services advance.
*/

const SERVICES = [
  {
    label: "Build",
    title: "Web products,\nend-to-end.",
    desc: 'From the first wireframe to the final deploy script — I take projects from "what if" to "v1 in production". One developer, fewer hand-off seams.',
    frameNum: "S/01",
    frameLabel: "Full-stack delivery",
    frameTitle: "Marketplace, dashboard, or SaaS — I bring it up.",
    items: [
      "Spec → architecture",
      "Design system + UI",
      "API, auth, payments",
      "CI/CD + monitoring",
    ],
  },
  {
    label: "Interfaces",
    title: "Front-end that\nfeels honest.",
    desc: "Real-feeling motion, accessible defaults, dark mode that isn't an afterthought. I write components other devs are happy to inherit.",
    frameNum: "S/02",
    frameLabel: "Front-end engineering",
    frameTitle: "React/Next interfaces that read as designed.",
    items: [
      "Design system buildout",
      "Animation + interaction",
      "A11y + performance budget",
      "TypeScript everywhere",
    ],
  },
  {
    label: "APIs",
    title: "Back-ends that\nstay boring.",
    desc: "I optimise for the engineer reading the code at 2am. Boring schemas, traceable jobs, no clever tricks — until they are absolutely required.",
    frameNum: "S/03",
    frameLabel: "API & data layer",
    frameTitle: "Postgres-first systems built to be debugged.",
    items: [
      "REST / tRPC / GraphQL",
      "Background jobs + queues",
      "Schema design + migrations",
      "Observability from day one",
    ],
  },
  {
    label: "Sparring",
    title: "Technical\nsparring partner.",
    desc: 'Already have a team? I plug in for tricky weeks — architecture reviews, hairy bug-hunts, design-system audits, "is this PR sane?" calls.',
    frameNum: "S/04",
    frameLabel: "Advisory & audits",
    frameTitle: "A senior pair of eyes, by the hour or sprint.",
    items: [
      "Architecture review",
      "Performance audit",
      "Code-review on retainer",
      "Hiring & tech interviews",
    ],
  },
];

export function Services() {
  const wrapRef = useRefS<HTMLDivElement>(null);
  const [step, setStep] = useStateS(0);
  const [subProgress, setSubProgress] = useStateS(0);

  useEffectS(() => {
    function onScroll() {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      const idx = Math.min(
        SERVICES.length - 1,
        Math.floor(p * SERVICES.length),
      );
      const sub = p * SERVICES.length - idx;
      setStep(idx);
      setSubProgress(sub);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="services"
      data-screen-label="03 Services"
      style={{ padding: 0 }}
    >
      <div className="services-wrap" ref={wrapRef}>
        <div className="services-sticky">
          <div className="services-inner">
            <div className="services-head">
              <div className="services-counter">
                <span className="now">{String(step + 1).padStart(2, "0")}</span>
                <span style={{ margin: "0 6px" }}>/</span>
                <span>{String(SERVICES.length).padStart(2, "0")}</span>
                <span style={{ margin: "0 10px" }}>—</span>
                <span>{SERVICES[step].label}</span>
              </div>
              <div className="service-title-stack">
                {SERVICES.map((s, i) => (
                  <h2
                    key={i}
                    className={`service-title display ${i === step ? "active" : i < step ? "past" : ""}`}
                  >
                    {s.title}
                  </h2>
                ))}
              </div>
              <div className="service-desc">
                {SERVICES.map((s, i) => (
                  <p
                    key={i}
                    className={`service-desc-item ${i === step ? "active" : i < step ? "past" : ""}`}
                  >
                    {s.desc}
                  </p>
                ))}
              </div>
            </div>
            <div className="service-visual">
              {SERVICES.map((s, i) => (
                <div
                  key={i}
                  className={`service-frame ${i === step ? "active" : ""}`}
                >
                  <div className="service-frame-num">{s.frameNum}</div>
                  <ServiceVisual
                    idx={i}
                    active={i === step}
                    sub={i === step ? subProgress : 0}
                  />
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <div className="service-frame-label">{s.frameLabel}</div>
                    <h4>{s.frameTitle}</h4>
                    <ul>
                      {s.items.map((it, j) => (
                        <li key={j}>{it}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="service-progress">
            {SERVICES.map((_, i) => (
              <div className="service-progress-seg" key={i}>
                <span
                  style={{
                    transform: `scaleX(${i < step ? 1 : i === step ? subProgress : 0})`,
                  }}
                ></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* abstract visual per service — placeholder-y geometric scenes that animate */
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
const visStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};
