import { H2, H3 } from "../ui/H2";
import { NavLink } from "../ui/nav-link";
import { KIND_LABEL, formatDate, type PostMeta } from "@/lib/posts";
import { RichText } from "../ui/rich-text";
import Link from "next/link";

export function Writing({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;

  return (
    <section id="writing" className="page-shell flex flex-col gap-10">
      <header className="flex justify-between em-accent">
        <H2>
          <em>Notes</em>
          <br />
          from the keyboard.
        </H2>
        <NavLink href="/blog" underline>
          Blog
        </NavLink>
      </header>

      <div data-reveal-stagger className="border-t border-line">
        {posts.map((post, i) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{ "--i": i } as React.CSSProperties}
            className="group flex flex-col gap-3 py-7 border-b border-line transition-colors duration-300 hover:bg-accent/2 lg:grid lg:grid-cols-[80px_140px_1fr_160px_100px] lg:gap-10 lg:items-center"
          >
            {/* top row on mobile · cells 1–2 on desktop */}
            <div className="flex justify-between items-center lg:contents">
              <div className="font-mono text-xs text-muted">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="font-mono text-xs text-muted">
                {formatDate(post.date)}
              </div>
            </div>

            <H3
              variant="serif"
              className="text-2xl leading-[1.2] transition-colors duration-300 group-hover:text-accent"
            >
              <RichText text={post.title} />
            </H3>

            {/* bottom row on mobile · cells 4–5 on desktop */}
            <div className="flex justify-between items-center lg:contents">
              <div className="font-mono text-xs text-muted tracking-wider">
                {post.readTime} min · {KIND_LABEL[post.kind] ?? post.kind}
              </div>
              <div className="justify-self-end font-mono text-xs text-muted">
                Read ↗
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
