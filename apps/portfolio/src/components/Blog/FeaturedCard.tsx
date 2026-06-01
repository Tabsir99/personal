import Image from "next/image";
import Link from "next/link";
import { KIND_LABEL, formatDate, type PostMeta } from "@/lib/posts";
import { H2 } from "@/components/ui/H2";
import { TagPill } from "./TagPill";

export default function FeaturedCard({ post }: { post: PostMeta }) {
  return (
    <article
      data-reveal
      className="relative bg-ink-2 border border-line rounded-[18px] overflow-hidden grid grid-cols-2 max-xl:grid-cols-1 w-full mb-20 transition-transform hover:-translate-y-1.5"
    >
      <div
        className="relative text-cream p-8 min-h-[380px] flex flex-col justify-between overflow-hidden before:pointer-events-none"
        aria-hidden="true"
      >
        {post.coverImageUrl && (
          <Image
            src={post.coverImageUrl}
            alt={`Cover image for ${post.title}`}
            fill
            sizes="(max-width: 980px) 100vw, 50vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="py-10 px-11 flex flex-col gap-5">
        <div className="flex justify-between items-center pb-3.5 border-b border-dashed border-cream/8">
          <span className="inline-block bg-accent text-cream px-3 py-[5px] rounded-full font-mono text-xs lowercase tracking-wider">
            featured · {KIND_LABEL[post.kind]}
          </span>
          <span className="font-mono text-muted text-xs">
            {formatDate(post.date)}
          </span>
        </div>
        <H2 className="mt-1.5">{post.title}</H2>
        <p className="text-cream-2 m-0 max-w-[60ch]">{post.excerpt}</p>
        <div className="flex flex-wrap gap-2 mt-auto">
          {post.tags.map((t) => (
            <TagPill key={t} tag={t} variant="outlined" asLink={false} />
          ))}
        </div>
        <Link
          className="group inline-flex items-center gap-4 self-start mt-4 px-[22px] py-3.5 bg-cream text-ink rounded-full font-bold text-sm transition overflow-hidden hover:bg-accent hover:translate-x-1"
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
