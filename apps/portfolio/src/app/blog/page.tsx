import type { Metadata } from "next";
import { ALL_TAGS, getFeaturedBlog, getRecentBlogs } from "@/lib/posts";
import PageTitle from "@/components/Blog/PageTitle";
import FeaturedCard from "@/components/Blog/FeaturedCard";
import PostRow from "@/components/Blog/PostRow";
import Filters from "@/components/Blog/Filters";
import Aside from "@/components/Blog/Aside";
import "./blog.css";

export const metadata: Metadata = {
  title: "Writing — tabsircg.com",
  description:
    "Field notes on databases, type systems, and the occasional 3 a.m. pager incident.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Writing — tabsircg.com",
    description: "Field notes from a software engineer.",
    type: "website",
    url: "/blog",
  },
};

type SearchParams = Promise<{ tag?: string }>;

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const activeTag = sp.tag ?? "all";

  const [featured, page] = await Promise.all([
    getFeaturedBlog(),
    getRecentBlogs(),
  ]);
  const rest = page.items.filter((b) => b.slug !== featured?.slug);
  const filtered =
    activeTag === "all" ? rest : rest.filter((b) => b.tags.includes(activeTag));

  return (
    <div className="blog page">
      <div className="max-w-6xl mx-auto">
        <PageTitle />
        <main className="layout">
          <section className="layout__main">
            {featured && activeTag === "all" && (
              <FeaturedCard post={featured} />
            )}
            <Filters
              tags={ALL_TAGS}
              active={activeTag}
              count={filtered.length}
            />
            <div className="rows">
              {filtered.length === 0 ? (
                <div className="empty">
                  <div className="empty__big">∅</div>
                  <div>
                    nothing tagged <code>#{activeTag}</code> yet — try another?
                  </div>
                </div>
              ) : (
                filtered.map((p, i) => (
                  <PostRow key={p.slug} post={p} idx={i} />
                ))
              )}
            </div>
          </section>
          <Aside />
        </main>
      </div>
    </div>
  );
}
