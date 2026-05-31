import type { HeroStat } from "@tabsircg/schemas/portfolio";
import { RichText, splitAccent } from "@/components/ui/rich-text";

export function About({ stats, text }: { stats: HeroStat[]; text: string }) {
  if (!text && stats.length === 0) return null;
  const lines = text.split("\n");
  let w = 0; // continuous word index so the staggered reveal flows across lines

  return (
    <section
      id="about"
      className="page-shell grid grid-cols-[1fr_1.6fr] gap-10 items-start max-md:grid-cols-1"
    >
      <div data-reveal className="grid grid-cols-2 gap-x-10 gap-y-7 pt-10">
        <div className="eyebrow col-span-2 border-b border-line pb-10">
          A short note
        </div>
        {stats.map((s, i) => (
          <div key={s.label + i} className="flex flex-col gap-1.5">
            <span className="font-serif text-4xl max-lg:text-3xl leading-none">
              <RichText text={s.value} />
            </span>
            <span className="font-mono text-xxs uppercase tracking-widest text-muted">
              <RichText text={s.label} />
            </span>
          </div>
        ))}
      </div>

      <div
        data-reveal-words
        className="text-[clamp(21px,2vw,32px)] leading-[1.45] max-w-[42ch]"
      >
        {lines.map((line, li) =>
          line.trim() === "" ? (
            <span key={li} className="block h-[0.5em]" aria-hidden />
          ) : (
            <span key={li} className="block">
              {splitAccent(line).flatMap((seg) =>
                seg.text
                  .split(" ")
                  .filter(Boolean)
                  .map((word) => {
                    const i = w++;
                    return (
                      <span
                        key={i}
                        className="word"
                        style={{ "--word-i": i } as React.CSSProperties}
                      >
                        {seg.accent ? (
                          <em className="text-accent italic">{word}</em>
                        ) : (
                          word
                        )}
                      </span>
                    );
                  }),
              )}
            </span>
          ),
        )}
      </div>
    </section>
  );
}
