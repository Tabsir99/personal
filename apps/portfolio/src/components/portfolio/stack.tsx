"use client";
import { useReveal } from "./useReveal";

/* =====================================================================
   Tech stack — categories of tools, with proficiency dots.
   ===================================================================== */

const STACK_CATEGORIES: { label: string; items: [string, number][] }[] = [
  {
    label: "Front-end",
    items: [
      ["React / Next.js", 4],
      ["TypeScript", 4],
      ["Tailwind / CSS", 4],
      ["Framer / Motion", 3],
      ["Vue (legacy)", 2],
    ],
  },
  {
    label: "Back-end",
    items: [
      ["Node.js / Express", 4],
      ["Go", 3],
      ["Python / FastAPI", 3],
      ["PostgreSQL", 4],
      ["Redis / BullMQ", 3],
    ],
  },
  {
    label: "Infra & DevOps",
    items: [
      ["Docker / Compose", 4],
      ["AWS (ECS, RDS, S3)", 3],
      ["Terraform", 2],
      ["GitHub Actions", 4],
      ["Grafana / Loki", 3],
    ],
  },
  {
    label: "Craft & tooling",
    items: [
      ["Figma + dev hand-off", 3],
      ["Vitest / Playwright", 3],
      ["Linear / Notion", 4],
      ["Cmd-line / Neovim", 4],
      ["Design systems", 4],
    ],
  },
];

export function Stack() {
  const [ref, vis] = useReveal();
  return (
    <section id="stack" className="stack" data-screen-label="05 Stack">
      <span className="margin-note" style={{ top: "260px" }}>
        stack-fluent,
        <br />
        not stack-religious.
      </span>
      <div className="container">
        <div className="stack-head">
          <h2 className="stack-title display">
            The tools
            <br />I lean on
            <br />
            <em style={{ color: "var(--accent)", fontStyle: "italic" }}>
              most days.
            </em>
          </h2>
          <p className="stack-blurb">
            Stack-fluent rather than stack-religious. I use what fits the team,
            the deadline, and the problem. These are the ones I've shipped to
            production this year.
          </p>
        </div>
        <div
          className={`stack-grid reveal-stagger ${vis ? "in" : ""}`}
          ref={ref}
        >
          {STACK_CATEGORIES.map((cat, i) => (
            <div className="stack-cat" key={i}>
              <div className="stack-cat-label">
                {String(i + 1).padStart(2, "0")} · {cat.label}
              </div>
              <div className="stack-items">
                {cat.items.map(([name, lvl], j) => (
                  <div className="stack-item" key={j}>
                    <span>{name}</span>
                    <span className="lvl">
                      {[0, 1, 2, 3, 4].map((k) => (
                        <span key={k} className={k < lvl ? "on" : ""}></span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
