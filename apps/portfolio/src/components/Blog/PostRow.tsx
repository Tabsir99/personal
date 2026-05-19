import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import InViewArticle from "./InViewArticle";

const KIND_LABEL: Record<PostMeta["kind"], string> = {
  essay: "essay",
  "deep-dive": "deep-dive",
  "war-story": "war story",
  notes: "notes",
};

const KIND_BADGE: Record<PostMeta["kind"], string> = {
  essay: "text-accent border-accent/40",
  "deep-dive": "text-phosphor border-phosphor/40",
  "war-story": "text-accent border-accent/40",
  notes: "text-muted",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PostRow({
  post,
  idx,
}: {
  post: PostMeta;
  idx: number;
}) {
  return (
    <InViewArticle
      className="group relative grid grid-cols-[56px_1fr] grid-rows-[auto_auto_auto_auto] gap-x-6 pt-7 pb-8 border-b border-line transition-[padding] duration-360 ease-blog first:pt-2 hover:pl-3 max-sm:grid-cols-1"
      style={{ ["--row-i" as string]: idx }}
    >
      <div className="row-span-4 font-mono text-sm text-muted pt-1.5 tabular-nums max-sm:hidden">
        {String(idx + 1).padStart(2, "0")}
      </div>
      <div className="flex items-center justify-between font-mono text-xs text-muted mb-2 max-sm:flex-col max-sm:items-start max-sm:gap-1.5">
        <div className="tracking-wide">{formatDate(post.date)}</div>
        <div>
          <span
            className={`inline-block px-2.5 py-[3px] rounded-full text-xs tracking-wider lowercase border border-line bg-ink-2 ${KIND_BADGE[post.kind]}`}
          >
            {KIND_LABEL[post.kind]}
          </span>
        </div>
      </div>
      <h3 className="m-0 mb-2 text-[clamp(28px,3.5vw,46px)] font-black tracking-[-0.03em] leading-[1.04] relative pb-1">
        <Link
          href={`/blog/${post.slug}`}
          className="inline-block cursor-pointer"
        >
          <span className="blog-marker group-hover:bg-size-[100%_100%]">
            {post.title}
          </span>
        </Link>
      </h3>
      <p className="text-cream-2 m-0 mb-[18px] max-w-[64ch]">{post.excerpt}</p>
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {post.tags.map((t) => (
            <Link
              key={t}
              href={`/blog?tag=${encodeURIComponent(t)}`}
              className="font-mono text-xs px-2.5 py-[3px] bg-ink-2 rounded-full text-cream-2 [transition:transform_200ms_ease,background-color_200ms_ease,color_200ms_ease] hover:-translate-y-px hover:bg-accent hover:text-cream"
              scroll={false}
            >
              #{t}
            </Link>
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
          className="inline-flex items-center gap-2 font-bold relative py-1 after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[1.5px] after:bg-cream after:scale-x-0 after:origin-right after:transition-transform after:duration-280 after:ease-blog group-hover:after:scale-x-100 group-hover:after:origin-left [&_svg]:transition-transform [&_svg]:duration-320 [&_svg]:ease-blog group-hover:[&_svg]:translate-x-1.5"
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
    </InViewArticle>
  );
}
