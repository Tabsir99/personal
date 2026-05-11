import Link from "next/link";
import type { Neighbour } from "@/lib/posts";

export default function PostFooter({
  prev,
  next,
}: {
  prev?: Neighbour | null;
  next?: Neighbour | null;
}) {
  return (
    <footer className="post-foot">
      <div className="post-foot__rule" aria-hidden="true" />

      <div className="post-foot__nav">
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="post-foot__card post-foot__card--prev"
          >
            <span className="post-foot__dir mono">
              <span className="post-foot__arrow" aria-hidden="true">←</span>
              previous
            </span>
            <span className="post-foot__title">{prev.title}</span>
          </Link>
        ) : (
          <div className="post-foot__card post-foot__card--empty" aria-hidden="true">
            <span className="post-foot__dir mono">— oldest</span>
          </div>
        )}

        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="post-foot__card post-foot__card--next"
          >
            <span className="post-foot__dir mono">
              next
              <span className="post-foot__arrow" aria-hidden="true">→</span>
            </span>
            <span className="post-foot__title">{next.title}</span>
          </Link>
        ) : (
          <div className="post-foot__card post-foot__card--empty" aria-hidden="true">
            <span className="post-foot__dir mono">newest —</span>
          </div>
        )}
      </div>

      <div className="post-foot__back">
        <Link href="/blog" className="post-foot__back-link mono">
          <span aria-hidden="true">←</span> all writing
        </Link>
      </div>
    </footer>
  );
}
