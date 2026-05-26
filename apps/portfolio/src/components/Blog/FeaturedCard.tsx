import Image from "next/image";
import Link from "next/link";
import { KIND_LABEL, formatDate, type PostMeta } from "@/lib/posts";
import { H2 } from "@/components/ui/H2";
import { TagPill } from "./TagPill";

export default function FeaturedCard({ post }: { post: PostMeta }) {
  return (
    <article
      data-reveal
      className="relative bg-ink-2 border border-line rounded-[18px] overflow-hidden grid grid-cols-[1.05fr_1fr] mb-20 shadow-[0_1px_0_rgba(0,0,0,0.4),0_6px_18px_-8px_rgba(0,0,0,0.6)] [transition:transform_400ms_var(--ease-soft),box-shadow_400ms_ease] hover:-translate-y-1.5 hover:shadow-[0_1px_0_rgba(0,0,0,0.4),0_30px_60px_-30px_rgba(0,0,0,0.8)] max-lg:grid-cols-1"
    >
      <div
        className="relative bg-[linear-gradient(160deg,oklch(20%_0.02_60),oklch(13%_0.02_60))] text-cream p-8 min-h-[380px] flex flex-col justify-between overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_20%_0%,color-mix(in_srgb,var(--color-accent)_35%,transparent),transparent_50%),radial-gradient(circle_at_100%_100%,color-mix(in_srgb,var(--color-phosphor)_30%,transparent),transparent_50%)] before:pointer-events-none max-lg:min-h-[240px]"
        aria-hidden="true"
      >
        <Image
          src={post.coverImageUrl}
          alt={`Cover image for ${post.title}`}
          fill
          sizes="(max-width: 980px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="py-10 px-11 flex flex-col gap-5 max-lg:p-7">
        <div className="flex justify-between items-center pb-3.5 border-b border-dashed border-cream/8">
          <span className="inline-block bg-accent text-cream px-3 py-[5px] rounded-full font-mono text-xs lowercase tracking-wider">
            featured · {KIND_LABEL[post.kind]}
          </span>
          <span className="font-mono text-muted text-xs">
            {formatDate(post.date)}
          </span>
        </div>
        <H2 variant="editorial" className="mt-1.5">
          {post.title}
        </H2>
        <p className="text-cream-2 m-0 max-w-[50ch]">{post.excerpt}</p>
        <div className="flex flex-wrap gap-2 mt-auto">
          {post.tags.map((t) => (
            <TagPill key={t} tag={t} variant="outlined" asLink={false} />
          ))}
        </div>
        <Link
          className="group inline-flex items-center gap-3.5 self-start mt-4 px-[22px] py-3.5 bg-cream text-ink rounded-full font-bold text-[15px] [transition:transform_240ms_var(--ease-soft),background-color_240ms_ease] overflow-hidden hover:bg-accent hover:translate-x-1"
          href={`/blog/${post.slug}`}
        >
          <span>read the post</span>
          <span className="flex transition-transform duration-320 ease-soft group-hover:translate-x-1.5">
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
    </article>
  );
}
