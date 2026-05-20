const STATS = [
  { value: "∼2", label: "Years shipping" },
  { value: "17", label: "Projects merged" },
  { value: "4", label: "Stacks daily" },
  { value: "0", label: "Frameworks worshipped" },
];

/* ===== About ===== */
export function About() {
  const text =
    "I write code for the messy middle — where product specs collide with reality. I care about response budgets, accessible focus rings, sensible primary keys, and shipping things small enough to fix on a Friday. Two years in, mostly across SaaS dashboards, marketplaces, and a handful of internal tools nobody ever sees but everyone depends on.";
  const words = text.split(" ");

  return (
    <section
      id="about"
      className="page-shell grid grid-cols-[1fr_1.6fr] gap-10 max-xl:grid-cols-1 items-start"
    >
      <span className="margin-note top-[220px]">no frameworks worshipped.</span>

      <div data-reveal className="grid grid-cols-2 gap-x-10 gap-y-7 pt-10 ">
        <div className="eyebrow col-span-2 border-b border-line pb-10">
          A short note
        </div>
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col gap-1.5">
            <span className="font-serif text-[48px] leading-none">
              {s.value}
            </span>
            <span className="font-mono text-xxs uppercase tracking-widest text-muted">
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <div
        data-reveal-words
        className="font-serif text-[clamp(28px,3.2vw,42px)] leading-[1.22] tracking-tight"
      >
        {words.map((w, i) => {
          const isAccent = ["quiet", "craft", "reality.", "middle"].some((t) =>
            w.toLowerCase().includes(t),
          );
          return (
            <span
              key={i}
              className="word"
              style={{ "--word-i": i } as React.CSSProperties}
            >
              {isAccent ? <em className="text-accent italic">{w}</em> : w}
            </span>
          );
        })}
      </div>
    </section>
  );
}
