import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import InViewArticle from "./InViewArticle";

const KIND_LABEL: Record<PostMeta["kind"], string> = {
  essay: "essay",
  "deep-dive": "deep-dive",
  "war-story": "war story",
  notes: "notes",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PostRow({ post, idx }: { post: PostMeta; idx: number }) {
  return (
    <InViewArticle
      className={`row row--${post.accent}`}
      style={{ ["--row-i" as string]: idx }}
    >
      <div className="row__num mono">{String(idx + 1).padStart(2, "0")}</div>
      <div className="row__head">
        <div className="row__date mono">{formatDate(post.date)}</div>
        <div className="row__kind">
          <span className={`kind kind--${post.kind}`}>{KIND_LABEL[post.kind]}</span>
        </div>
      </div>
      <h3 className="row__title">
        <Link href={`/blog/${post.slug}`} className="row__title-link">
          <span className="row__title-text">{post.title}</span>
        </Link>
      </h3>
      <p className="row__excerpt">{post.excerpt}</p>
      <div className="row__foot">
        <div className="row__tags">
          {post.tags.map((t) => (
            <Link
              key={t}
              href={`/blog?tag=${encodeURIComponent(t)}`}
              className="chip"
              scroll={false}
            >
              #{t}
            </Link>
          ))}
        </div>
        <div className="row__time mono">
          <span className="row__time-bar">
            <span style={{ width: `${Math.min(100, post.readTime * 4)}%` }} />
          </span>
          {post.readTime} min read
        </div>
        <Link href={`/blog/${post.slug}`} className="row__cta">
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
