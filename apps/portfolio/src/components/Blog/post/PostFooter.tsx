import Link from "next/link";
import type { Neighbour } from "@/lib/posts";

const CARD_BASE =
  "group flex flex-col gap-2 px-6 py-[22px] border border-line rounded-md bg-transparent no-underline text-cream [transition:background-color_220ms_ease,border-color_220ms_ease,transform_220ms_var(--ease-soft)] min-h-[116px] hover:bg-ink-2 hover:border-cream";
const CARD_EMPTY =
  "flex flex-col gap-2 px-6 py-[22px] border border-line border-dashed rounded-md bg-transparent cursor-default min-h-[116px]";
const DIR_BASE =
  "inline-flex items-center gap-2 font-mono text-xs tracking-[0.06em] uppercase";

export default function PostFooter({
  prev,
  next,
}: {
  prev?: Neighbour | null;
  next?: Neighbour | null;
}) {
  return (
    <footer className="mt-24 pb-24">
      <div
        className="h-px bg-line mb-12 relative before:content-['✦'] before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-ink before:px-3.5 before:text-accent before:text-sm"
        aria-hidden="true"
      />

      <div className="grid grid-cols-2 gap-6 mb-14 max-[720px]:grid-cols-1">
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className={`${CARD_BASE} hover:-translate-x-1`}
          >
            <span className={`${DIR_BASE} text-muted`}>
              <span
                className="text-sm text-accent transition-transform duration-220 ease-soft group-hover:-translate-x-1"
                aria-hidden="true"
              >
                ←
              </span>
              previous
            </span>
            <span className="font-serif italic text-[clamp(20px,2.4vw,26px)] leading-[1.15] text-cream tracking-tight">
              {prev.title}
            </span>
          </Link>
        ) : (
          <div className={CARD_EMPTY} aria-hidden="true">
            <span className={`${DIR_BASE} text-muted`}>— oldest</span>
          </div>
        )}

        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className={`${CARD_BASE} text-right items-end hover:translate-x-1`}
          >
            <span className={`${DIR_BASE} text-muted`}>
              next
              <span
                className="text-sm text-accent transition-transform duration-220 ease-soft group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </span>
            <span className="font-serif italic text-[clamp(20px,2.4vw,26px)] leading-[1.15] text-cream tracking-tight">
              {next.title}
            </span>
          </Link>
        ) : (
          <div
            className={`${CARD_EMPTY} text-right items-end`}
            aria-hidden="true"
          >
            <span className={`${DIR_BASE} text-muted`}>newest —</span>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Link
          href="/blog"
          className="font-mono inline-flex items-center gap-2 px-[18px] py-2.5 text-xs text-cream-2 no-underline rounded-full border border-transparent tracking-wider [transition:color_200ms_ease,border-color_200ms_ease,background-color_200ms_ease] hover:text-accent hover:border-accent hover:bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)]"
        >
          <span aria-hidden="true">←</span> all writing
        </Link>
      </div>
    </footer>
  );
}
