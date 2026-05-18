import Link from "next/link";

const TAG_BASE =
  "relative inline-flex items-center gap-1 px-4 py-[9px] border border-line rounded-full text-[13.5px] font-medium lowercase bg-ink-2 text-cream transition-[background-color,color,transform] duration-[220ms] ease-blog z-[1] hover:-translate-y-0.5 hover:-rotate-[1.5deg]";
const TAG_ON = "bg-cream! text-ink! -rotate-1!";

export default function Filters({
  tags,
  active,
  count,
}: {
  tags: string[];
  active: string;
  count: number;
}) {
  return (
    <div className="sticky top-0 bg-ink z-10 pt-4 pb-[22px] mb-6 border-b border-line before:content-[''] before:absolute before:-left-8 before:-right-8 before:top-0 before:bottom-0 before:bg-ink before:-z-10">
      <div className="flex justify-between items-baseline mb-[18px]">
        <h2 className="m-0 text-[28px] tracking-[-0.02em] font-black flex items-baseline gap-3.5">
          <span className="tabular-nums font-mono text-lg text-accent bg-accent/8 px-2.5 py-1 rounded-md">
            {String(count).padStart(2, "0")}
          </span>
          <span>posts in the archive</span>
        </h2>
      </div>
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter by tag"
      >
        {tags.map((t) => {
          const isOn = active === t;
          const href =
            t === "all" ? "/blog" : `/blog?tag=${encodeURIComponent(t)}`;
          return (
            <Link
              key={t}
              href={href}
              role="tab"
              aria-selected={isOn}
              className={isOn ? `${TAG_BASE} ${TAG_ON}` : TAG_BASE}
              scroll={false}
            >
              <span
                className={
                  isOn
                    ? "text-cream-2 transition-colors duration-[220ms]"
                    : "text-muted transition-colors duration-[220ms]"
                }
              >
                #
              </span>
              {t}
              {isOn && (
                <span
                  className="absolute -right-[3px] -top-[3px] w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_0_2px_var(--color-ink)]"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
