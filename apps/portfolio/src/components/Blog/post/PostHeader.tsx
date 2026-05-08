import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

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

export default function PostHeader({ post }: { post: PostMeta }) {
  return (
    <header className="post-head">
      <nav className="post-head__crumbs mono" aria-label="Breadcrumb">
        <Link href="/">tabsircg.com</Link>
        <span aria-hidden="true">/</span>
        <Link href="/blog">blog</Link>
        <span aria-hidden="true">/</span>
        <span className="post-head__crumbs-current">{post.slug}</span>
      </nav>

      <div className="post-head__kicker">
        <span className={`kicker kicker--${post.kind}`}>{KIND_LABEL[post.kind]}</span>
        <span className="post-head__kicker-sep" aria-hidden="true" />
        <time className="mono mono--mute" dateTime={post.date}>
          {formatDate(post.date)}
        </time>
      </div>

      <h1 className="post-head__title">{post.title}</h1>

      <p className="post-head__dek">{post.dek}</p>

      <dl className="post-head__meta mono">
        <div className="post-head__meta-row">
          <dt>read</dt>
          <dd>
            <span className="post-head__bar" aria-hidden="true">
              <span style={{ width: `${Math.min(100, post.readTime * 4)}%` }} />
            </span>
            {post.readTime} min
          </dd>
        </div>
        <div className="post-head__meta-row">
          <dt>tags</dt>
          <dd className="post-head__tags">
            {post.tags.map((t) => (
              <Link
                key={t}
                href={`/blog?tag=${encodeURIComponent(t)}`}
                className="chip"
              >
                #{t}
              </Link>
            ))}
          </dd>
        </div>
      </dl>
    </header>
  );
}
