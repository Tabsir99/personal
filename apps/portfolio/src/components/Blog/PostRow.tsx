import Link from "next/link";
import { KIND_LABEL, formatDate, type PostMeta } from "@/lib/posts";
import { H3 } from "@/components/ui/H2";
import { TagPill } from "./TagPill";

const KIND_BADGE: Record<PostMeta["kind"], string> = {
  essay: "text-accent border-accent/40",
  "deep-dive": "text-phosphor border-phosphor/40",
  "war-story": "text-accent border-accent/40",
  notes: "text-muted",
};

export default function PostRow({
  post,
  idx,
}: {
  post: PostMeta;
  idx: number;
}) {
  return (
    <article
      data-reveal
      className="group relative grid grid-cols-[56px_1fr] grid-rows-[auto_auto_auto_auto] gap-x-6 pt-7 pb-8 border-b border-line transition-[padding] duration-360 ease-soft first:pt-2 hover:pl-3 max-sm:grid-cols-1"
      style={{ ["--row-i" as string]: idx }}
    >
      <div className="row-span-4 font-mono text-sm text-muted pt-1.5 tabular-nums max-sm:hidden">
        {String(idx + 1).padStart(2, "0")}
      </div>
      <div className="flex items-center justify-between font-mono text-xs text-muted mb-2 max-sm:flex-col max-sm:items-start max-sm:gap-1.5">
        <div className="tracking-wide">{formatDate(post.date)}</div>
        <span
          className={`inline-block px-2.5 py-[3px] rounded-full text-xs tracking-wider lowercase border border-line bg-ink-2 ${KIND_BADGE[post.kind]}`}
        >
          {KIND_LABEL[post.kind]}
        </span>
      </div>
      <H3 variant="editorial" className="mb-2 relative pb-1">
        <Link
          href={`/blog/${post.slug}`}
          className="inline-block cursor-pointer"
        >
          <span className="blog-marker group-hover:bg-size-[100%_100%]">
            {post.title}
          </span>
        </Link>
      </H3>
      <p className="text-cream-2 m-0 mb-[18px] max-w-[64ch]">{post.excerpt}</p>
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {post.tags.map((t) => (
            <TagPill key={t} tag={t} scroll={false} />
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2.5 text-xs text-muted font-mono">
          <span className="inline-block w-[60px] h-[3px] rounded-xs bg-cream/8 overflow-hidden">
            <span
              className="block h-full bg-cream origin-left"
              style={{ width: `${Math.min(100, post.readTime * 4)}%` }}
            />
          </span>
          {post.readTime} min read
        </div>
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-2 font-bold relative py-1 after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[1.5px] after:bg-cream after:scale-x-0 after:origin-right after:transition-transform after:duration-280 after:ease-soft group-hover:after:scale-x-100 group-hover:after:origin-left [&_svg]:transition-transform [&_svg]:duration-320 [&_svg]:ease-soft group-hover:[&_svg]:translate-x-1.5"
        >
          read
          <svg viewBox="0 0 28 10" width="28" height="10" aria-hidden="true">
            <path
              d="M0 5 H24 M20 1 L24 5 L20 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}
