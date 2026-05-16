"use client";
import { useState, useEffect, useRef } from "react";
import { ServiceVisual } from "./service-visual";

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
  const wrapRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [subProgress, setSubProgress] = useState(0);

  useEffect(() => {
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
