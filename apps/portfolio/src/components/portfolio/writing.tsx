"use client";
import { useReveal } from "./useReveal";

/* ===== Writing ===== */

const ARTICLES = [
  {
    num: "01",
    date: "2026 · 04",
    title: 'On the tyranny of "just one more abstraction"',
    meta: "12 min · Engineering",
  },
  {
    num: "02",
    date: "2026 · 02",
    title: "Postgres is enough — for the first 10,000 users",
    meta: "8 min · Backend",
  },
  {
    num: "03",
    date: "2025 · 11",
    title: "How I write components I will not hate in six months",
    meta: "14 min · Frontend",
  },
  {
    num: "04",
    date: "2025 · 09",
    title: "A junior dev's field-guide to reading other people's code",
    meta: "10 min · Career",
  },
  {
    num: "05",
    date: "2025 · 07",
    title: "Quiet animation: motion that doesn't beg for attention",
    meta: "7 min · Design",
  },
];

export function Writing() {
  const [ref, vis] = useReveal();
  return (
    <section id="writing" data-screen-label="06 Writing">
      <div className="container">
        <div className="work-head">
          <h2 className="work-title display">
            <em>Notes</em>
            <br />
            from the keyboard.
          </h2>
          <div className="work-count">
            <div>{ARTICLES.length} posts</div>
            <div style={{ marginTop: 6, color: "var(--muted-2)" }}>
              read more →
            </div>
          </div>
        </div>
        <div
          className={`writing-list reveal-stagger ${vis ? "in" : ""}`}
          ref={ref}
        >
          {ARTICLES.map((a) => (
            <a key={a.num} className="write-row" href="#">
              <div className="write-num">{a.num}</div>
              <div className="write-date">{a.date}</div>
              <div className="write-title-text display">{a.title}</div>
              <div className="write-meta">{a.meta}</div>
              <div className="write-arrow">Read ↗</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
