import Link from "next/link";
import { H2 } from "@/components/ui/H2";

const TAG_BASE =
  "relative inline-flex items-center gap-1 px-4 py-[9px] border border-line rounded-full text-sm font-medium lowercase bg-ink-2 text-cream transition-[background-color,color,translate,rotate] duration-220 ease-soft z-1 hover:-translate-y-0.5 hover:rotate-[-1.5deg]";
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
    <div className="sticky top-0 z-10 py-10 px-6 mb-6  border-b border-line bg-bg">
      <H2
        variant="editorial"
        className="mb-[18px] text-3xl flex items-baseline gap-3.5"
      >
        <span className="not-italic tabular-nums font-mono text-lg text-accent bg-accent/8 px-2.5 py-1 rounded-md">
          {String(count).padStart(2, "0")}
        </span>
        posts in the archive
      </H2>
      <nav className="flex flex-wrap gap-2" aria-label="Filter by tag">
        {tags.map((t) => {
          const isOn = active === t;
          const href =
            t === "all" ? "/blog" : `/blog?tag=${encodeURIComponent(t)}`;
          return (
            <Link
              key={t}
              href={href}
              aria-current={isOn ? "page" : undefined}
              className={isOn ? `${TAG_BASE} ${TAG_ON}` : TAG_BASE}
              scroll={false}
            >
              <span
                className={`transition-colors duration-220 ${isOn ? "text-cream-2" : "text-muted"}`}
              >
                #
              </span>
              {t}
              {isOn && (
                <span
                  className="absolute -right-1 -top-1 size-2.5 rounded-full bg-accent shadow-[0_0_0_2px_var(--color-ink)]"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
