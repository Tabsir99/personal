import { H2, H3 } from "../ui/H2";
import { NavLink } from "../ui/nav-link";
import { KIND_LABEL, formatDate, type PostMeta } from "@/lib/posts";

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
          All writing ↗
        </NavLink>
      </header>

      <div data-reveal-stagger className="border-t border-line">
        {posts.map((post, i) => (
          <a
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{ "--i": i } as React.CSSProperties}
            className="group grid grid-cols-[80px_140px_1fr_160px_100px] gap-10 items-center py-7 border-b border-line transition-colors duration-300 hover:bg-accent/2 max-xl:grid-cols-[60px_120px_1fr_auto]"
          >
            <div className="font-mono text-xs text-muted">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="font-mono text-xs text-muted">
              {formatDate(post.date)}
            </div>
            <H3
              variant="serif"
              className="text-[26px] leading-[1.2] transition-colors duration-300 group-hover:text-accent"
            >
              {post.title}
            </H3>
            <div className="font-mono text-xs text-muted tracking-wider max-xl:hidden">
              {post.readTime} min · {KIND_LABEL[post.kind] ?? post.kind}
            </div>
            <div className="justify-self-end font-mono text-xs text-muted max-xl:hidden">
              Read ↗
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
