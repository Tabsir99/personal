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
    <InViewArticle className="relative bg-ink-2 border border-line rounded-[18px] overflow-hidden grid grid-cols-[1.05fr_1fr] mb-20 shadow-[0_1px_0_rgba(0,0,0,0.4),0_6px_18px_-8px_rgba(0,0,0,0.6)] [transition:transform_400ms_var(--ease-blog),box-shadow_400ms_ease] hover:-translate-y-1.5 hover:shadow-[0_1px_0_rgba(0,0,0,0.4),0_30px_60px_-30px_rgba(0,0,0,0.8)] max-[980px]:grid-cols-1">
      <div
        className="relative bg-[linear-gradient(160deg,oklch(20%_0.02_60),oklch(13%_0.02_60))] text-cream p-8 min-h-[380px] flex flex-col justify-between overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_20%_0%,color-mix(in_srgb,var(--color-accent)_35%,transparent),transparent_50%),radial-gradient(circle_at_100%_100%,color-mix(in_srgb,var(--color-phosphor)_30%,transparent),transparent_50%)] before:pointer-events-none max-[980px]:min-h-[240px]"
        aria-hidden="true"
      >
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover block"
          />
        ) : (
          <>
            <div className="relative grid grid-cols-12 gap-1 flex-1 mb-4">
              {Array.from({ length: 60 }).map((_, i) => (
                <span
                  key={i}
                  className="block h-3.5 rounded-[2px] bg-[color-mix(in_srgb,var(--color-accent)_30%,transparent)] odd:bg-[color-mix(in_srgb,oklch(72%_0.13_60)_40%,transparent)] [&:nth-child(7n)]:bg-[color-mix(in_srgb,var(--color-phosphor)_50%,transparent)] animate-blog-bar"
                  style={{ animationDelay: `${(i % 12) * 80}ms` }}
                />
              ))}
            </div>
            <div className="relative text-xs flex gap-2.5 items-baseline">
              <span className="font-mono">EXPLAIN ANALYZE</span>
              <span className="font-mono text-muted">
                — rows=4_207_388 · cost=14_902.11
              </span>
            </div>
            <div className="relative mt-3 h-1 rounded-[2px] bg-[oklch(20%_0.02_60)] overflow-visible">
              <div className="absolute left-0 top-0 bottom-0 w-[12%] bg-accent rounded-[2px] animate-blog-shrink shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_15%,transparent)]" />
              <span className="absolute right-0 -top-[22px] text-[11px] text-[oklch(72%_0.13_60)] font-mono">
                ↓ 40s → 412ms
              </span>
            </div>
          </>
        )}
      </div>
      <div className="p-10 px-11 flex flex-col gap-[18px] max-[980px]:p-7">
        <div className="flex justify-between items-center pb-3.5 border-b border-dashed border-cream/8">
          <span className="inline-block bg-accent text-cream px-3 py-[5px] rounded-full font-mono text-[11px] lowercase tracking-[0.04em]">
            featured · {KIND_LABEL[post.kind]}
          </span>
          <span className="font-mono text-muted text-xs">
            {formatDate(post.date)}
          </span>
        </div>
        <h2 className="text-[clamp(28px,3vw,40px)] font-black tracking-[-0.025em] leading-[1.05] mt-1.5 mx-0 mb-0">
          {post.title}
        </h2>
        <p className="text-cream-2 text-[16.5px] leading-[1.55] m-0 max-w-[50ch]">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap gap-2 mt-auto">
          {post.tags.map((t) => (
            <span
              key={t}
              className="font-mono text-xs px-2.5 py-[3px] bg-transparent border border-cream/8 rounded-full text-cream-2 [transition:transform_200ms_ease,background-color_200ms_ease,color_200ms_ease] hover:-translate-y-px hover:bg-accent hover:text-cream"
            >
              #{t}
            </span>
          ))}
        </div>
        <Link
          className="group inline-flex items-center gap-3.5 self-start mt-4 px-[22px] py-3.5 bg-cream text-ink rounded-full font-bold text-[15px] [transition:transform_240ms_var(--ease-blog),background-color_240ms_ease] overflow-hidden hover:bg-accent hover:translate-x-1"
          href={`/blog/${post.slug}`}
        >
          <span>read the post</span>
          <span className="flex transition-transform duration-[320ms] ease-blog group-hover:translate-x-1.5">
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
