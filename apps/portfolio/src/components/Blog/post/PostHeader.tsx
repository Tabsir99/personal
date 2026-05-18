import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

const KIND_LABEL: Record<PostMeta["kind"], string> = {
  essay: "essay",
  "deep-dive": "deep-dive",
  "war-story": "war story",
  notes: "notes",
};

const KIND_KICKER: Record<PostMeta["kind"], string> = {
  essay: "bg-cream text-ink",
  "deep-dive": "bg-phosphor text-ink",
  "war-story": "bg-accent text-cream",
  notes: "bg-ink-2 text-cream-2",
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
    <header className="pb-10 border-b border-line mb-12 max-[640px]:pb-7 max-[640px]:mb-8">
      <nav
        className="font-mono inline-flex items-center gap-2.5 text-xs text-muted mb-8 tracking-[0.02em] max-[640px]:mb-5"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="transition-colors duration-200 hover:text-cream"
        >
          tabsircg.com
        </Link>
        <span aria-hidden="true" className="text-cream/8">
          /
        </span>
        <Link
          href="/blog"
          className="transition-colors duration-200 hover:text-cream"
        >
          blog
        </Link>
        <span aria-hidden="true" className="text-cream/8">
          /
        </span>
        <span className="text-cream font-bold">{post.slug}</span>
      </nav>

      <div className="flex items-center gap-3.5 mb-7">
        <span
          className={`inline-block px-3 py-[5px] rounded-full font-mono text-[11px] lowercase tracking-[0.04em] ${KIND_KICKER[post.kind]}`}
        >
          {KIND_LABEL[post.kind]}
        </span>
        <span
          className="shrink-0 w-6 h-px bg-line opacity-40"
          aria-hidden="true"
        />
        <time
          className="font-mono text-muted text-xs"
          dateTime={post.date}
        >
          {formatDate(post.date)}
        </time>
      </div>

      <h1 className="font-serif italic text-[clamp(40px,6vw,80px)] leading-[0.95] tracking-[-0.035em] m-0 mb-6 text-cream text-balance max-[640px]:mb-[18px]">
        {post.title}
      </h1>

      <p className="text-[clamp(18px,1.6vw,22px)] leading-[1.45] text-cream-2 max-w-[56ch] m-0 mb-9 font-light text-pretty max-[640px]:mb-6">
        {post.dek}
      </p>

      <dl className="font-mono flex flex-wrap gap-7 m-0 text-xs text-muted max-[640px]:gap-4">
        <div className="flex items-center gap-3 m-0">
          <dt className="uppercase tracking-[0.08em] text-[10px] after:content-['_›'] after:opacity-50">
            read
          </dt>
          <dd className="m-0 flex items-center gap-2.5 text-cream">
            <span
              className="inline-block w-[60px] h-[3px] rounded-[2px] bg-cream/8 overflow-hidden"
              aria-hidden="true"
            >
              <span
                className="block h-full bg-cream origin-left animate-post-bar-fill"
                style={{ width: `${Math.min(100, post.readTime * 4)}%` }}
              />
            </span>
            {post.readTime} min
          </dd>
        </div>
        <div className="flex items-center gap-3 m-0">
          <dt className="uppercase tracking-[0.08em] text-[10px] after:content-['_›'] after:opacity-50">
            tags
          </dt>
          <dd className="m-0 flex items-center gap-2.5 text-cream inline-flex flex-wrap">
            {post.tags.map((t) => (
              <Link
                key={t}
                href={`/blog?tag=${encodeURIComponent(t)}`}
                className="font-mono text-xs px-2.5 py-[3px] bg-ink-2 text-cream-2 rounded-full no-underline [transition:transform_200ms_ease,background-color_200ms_ease,color_200ms_ease] hover:bg-accent hover:text-cream hover:-translate-y-px"
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
