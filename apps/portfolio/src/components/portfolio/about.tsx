"use client";
import { useReveal } from "./useReveal";

/* ===== About ===== */
export function About() {
  const [ref, vis] = useReveal();
  const text =
    "I write code for the messy middle — where product specs collide with reality. I care about response budgets, accessible focus rings, sensible primary keys, and shipping things small enough to fix on a Friday. Two years in, mostly across SaaS dashboards, marketplaces, and a handful of internal tools nobody ever sees but everyone depends on.";
  const words = text.split(" ");

  return (
    <section id="about" className="about" data-screen-label="02 About">
      <span className="margin-note" style={{ top: "220px" }}>
        no frameworks worshipped.
      </span>

      <div className="container">
        <div className="about-grid" ref={ref}>
          <div className={`reveal ${vis ? "in" : ""}`}>
            <div className="eyebrow">A short note</div>
            <div className="about-stats">
              <div className="stat">
                <span className="num">∼2</span>
                <span className="lbl">Years shipping</span>
              </div>
              <div className="stat">
                <span className="num">17</span>
                <span className="lbl">Projects merged</span>
              </div>
              <div className="stat">
                <span className="num">4</span>
                <span className="lbl">Stacks daily</span>
              </div>
              <div className="stat">
                <span className="num">0</span>
                <span className="lbl">Frameworks worshipped</span>
              </div>
            </div>
          </div>
          <div className={`about-text word-reveal`}>
            {words.map((w, i) => {
              const isAccent = ["quiet", "craft", "reality.", "middle"].some(
                (t) => w.toLowerCase().includes(t),
              );
              return (
                <span
                  key={i}
                  className={`word ${vis ? "on" : ""}`}
                  style={{ transitionDelay: `${0.3 + i * 0.025}s` }}
                >
                  {isAccent ? <em className="accent">{w}</em> : w}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
