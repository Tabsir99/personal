/* ===== Writing ===== */

import { H2 } from "../ui/H2";

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
  return (
    <section id="writing" className="page-shell flex flex-col gap-10">
      <H2 className="em-accent">
        <em>Notes</em>
        <br />
        from the keyboard.
      </H2>

      <div data-reveal-stagger className="border-t border-line">
        {ARTICLES.map((a, i) => (
          <a
            key={a.num}
            style={{ "--i": i } as React.CSSProperties}
            className="group grid grid-cols-[80px_100px_1fr_140px_100px] gap-10 items-center py-7 border-b border-line transition-colors duration-300 hover:bg-accent/2"
          >
            <div className="font-mono text-xs text-muted">{a.num}</div>
            <div className="font-mono text-xs text-muted">{a.date}</div>
            <h3 className="h-serif text-[26px] leading-[1.2] transition-colors duration-300 group-hover:text-accent">
              {a.title}
            </h3>
            <div className="font-mono text-xs text-muted tracking-wider">
              {a.meta}
            </div>
            <div className="justify-self-end font-mono text-xs text-muted">
              Read ↗
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
