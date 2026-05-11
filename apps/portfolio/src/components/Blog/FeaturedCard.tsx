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

export default function FeaturedCard({ post }: { post: PostMeta }) {
  return (
    <InViewArticle className="feat">
      <div className="feat__media" aria-hidden="true">
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt=""
            className="feat__media-img"
          />
        ) : (
          <>
            <div className="feat__media-grid">
              {Array.from({ length: 60 }).map((_, i) => (
                <span key={i} style={{ animationDelay: `${(i % 12) * 80}ms` }} />
              ))}
            </div>
            <div className="feat__media-caption">
              <span className="mono">EXPLAIN ANALYZE</span>
              <span className="mono mono--mute">
                — rows=4_207_388 · cost=14_902.11
              </span>
            </div>
            <div className="feat__media-bar">
              <div className="feat__media-bar-fill" />
              <span className="mono mono--mute">↓ 40s → 412ms</span>
            </div>
          </>
        )}
      </div>
      <div className="feat__body">
        <div className="feat__kicker">
          <span className="kicker">featured · {KIND_LABEL[post.kind]}</span>
          <span className="mono mono--mute">{formatDate(post.date)}</span>
        </div>
        <h2 className="feat__title">{post.title}</h2>
        <p className="feat__excerpt">{post.excerpt}</p>
        <div className="feat__tags">
          {post.tags.map((t) => (
            <span key={t} className="chip chip--ghost">
              #{t}
            </span>
          ))}
        </div>
        <Link className="feat__read" href={`/blog/${post.slug}`}>
          <span>read the post</span>
          <span className="feat__arrow">
            <svg viewBox="0 0 40 14" width="40" height="14" aria-hidden="true">
              <path
                d="M0 7 H36 M30 1 L36 7 L30 13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>
      </div>
    </InViewArticle>
  );
}
