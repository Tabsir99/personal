import type { HeroStat } from "@tabsircg/schemas/portfolio";

export function About({
  stats,
  text,
}: {
  stats: HeroStat[];
  text: string;
}) {
  if (!text && stats.length === 0) return null;
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
        {stats.map((s, i) => (
          <div key={s.label + i} className="flex flex-col gap-1.5">
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
