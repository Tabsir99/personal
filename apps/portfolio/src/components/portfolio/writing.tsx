import { cn } from "@/lib/utils";

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
  return (
    <section id="writing" data-screen-label="06 Writing">
      <div className={"container"}>
        <div
          className={cn(
            "flex justify-between items-end mb-14",
            "max-[1100px]:flex-col max-[1100px]:items-start max-[1100px]:gap-4",
          )}
        >
          <h2
            className={cn(
              "font-serif font-normal tracking-[-0.02em] font-features-['liga','kern']",
              "text-[clamp(52px,7vw,96px)] leading-none",
              "[&_em]:text-accent [&_em]:italic",
            )}
          >
            <em>Notes</em>
            <br />
            from the keyboard.
          </h2>
          <div
            className={cn(
              "font-mono text-[11px] tracking-[0.14em] text-muted text-right",
              "max-[1100px]:text-left",
            )}
          >
            <div>{ARTICLES.length} posts</div>
            <div className="mt-1.5 text-muted-2">read more →</div>
          </div>
        </div>
        <div data-reveal-stagger className="border-t border-line">
          {ARTICLES.map((a, i) => (
            <a
              key={a.num}
              style={{ "--i": i } as React.CSSProperties}
              className={cn(
                "group grid grid-cols-[80px_100px_1fr_140px_100px] gap-10 items-center",
                "py-7 border-b border-line cursor-pointer",
                "transition-colors duration-300 hover:bg-accent/2",
              )}
              href="#"
            >
              <div className="font-mono text-[11px] text-muted-2">{a.num}</div>
              <div className="font-mono text-[11px] text-muted">{a.date}</div>
              <div
                className={cn(
                  "font-serif font-normal tracking-[-0.01em] font-features-['liga','kern']",
                  "text-[26px] leading-[1.2]",
                  "transition-colors duration-300 group-hover:text-accent",
                )}
              >
                {a.title}
              </div>
              <div className="font-mono text-[11px] text-muted tracking-wider">
                {a.meta}
              </div>
              <div className="justify-self-end font-mono text-[11px] text-muted">
                Read ↗
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
